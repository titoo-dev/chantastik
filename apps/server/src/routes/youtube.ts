import { Hono } from "hono";
import { v4 as uuidv4 } from 'uuid';
import { Bindings, Project } from "../types";
import { checkRateLimit, extractLyricsFromTitle, extractVideoId, parseDurationToSeconds, sanitizeSearchQuery, sanitizeYouTubeResponse, saveProject } from "../utils";

const youtube = new Hono<{
    Bindings: Bindings;
}>();

/**
 * Create a project from YouTube video metadata without downloading audio
 * @route POST /from-youtube
 * @param {Object} request.body - YouTube video metadata
 * @returns {Object} JSON response with project ID
 */
youtube.post('/from-youtube', async (c) => {
	try {
		const { videoId, title, channelTitle, duration, thumbnail, url, description } = await c.req.json();

		if (!videoId || !title) {
			return c.json({ error: 'Video ID and title are required' }, 400);
		}

		// Create simplified project without audio dependency
		const projectId = uuidv4();
		const now = new Date().toISOString();

		const project: Project = {
			id: projectId,
			name: `${title.substring(0, 100)} - ${channelTitle.substring(0, 50)}`,
			createdAt: now,
			updatedAt: now,
			audioId: `youtube-virtual-${videoId}`, // Use a virtual audio ID
			metadata: {
				tags: ['youtube', 'playlist', 'virtual'],
				category: 'youtube-import',
        link: url,
			},
		};

		// Store YouTube metadata separately in project KV with a special key
		const youtubeMetadata = {
			videoId,
			title,
			channelTitle,
			duration,
			thumbnail,
			url,
			description: description?.substring(0, 500) || '',
			parsedDuration: parseDurationToSeconds(duration),
			isVirtual: true,
			importedAt: now,
		};

		await saveProject(c.env.PROJECT_KV, project);
    await c.env.COVER_FILES.put(`cover:${projectId}`, thumbnail || '');
		
		// Store YouTube metadata with special key
		await c.env.PROJECT_KV.put(`youtube-meta:${projectId}`, JSON.stringify(youtubeMetadata));

		return c.json({
			message: 'Project created from YouTube video',
			projectId: projectId,
			youtubeMetadata: youtubeMetadata,
		});
	} catch (error) {
		console.error('Error creating YouTube project:', error);
		return c.json({ error: 'Failed to create project' }, 500);
	}
});



youtube.get('/search', async (c) => {
  const input = c.req.query('input')?.trim();
  if (!input) {
    return c.text('Missing input', 400);
  }

  // Rate limiting
  const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const { allowed } = await checkRateLimit(c.env.AUDIO_KV, `youtube:${clientIP}`, 10, 60);
  if (!allowed) {
    return c.text('Rate limit exceeded. Please try again later.', 429);
  }

  // Vérifier si c'est une URL
  const isUrl = /^https?:\/\//i.test(input);

  try {
    const apiKey = c.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return c.text('YouTube API key not configured', 500);
    }

    if (isUrl) {
      // 🔹 URL case → extract the ID and fetch directly
      const videoId = extractVideoId(input);
      if (!videoId) {
        return c.text('Invalid YouTube URL', 400);
      }
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
      const resp = await fetch(detailsUrl);
      if (!resp.ok) return c.text('Failed to fetch video details', 503);

      const data = await resp.json();
      if (!data.items?.length) return c.json({ results: [] });

      const item = data.items[0];
      return c.json({
        results: [{
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.high?.url,
          channelTitle: item.snippet.channelTitle,
          duration: item.contentDetails?.duration || 'PT0S',
        }]
      });
    } else {
      // 🔹 Cas recherche texte → API search
      const sanitized = sanitizeSearchQuery(input).sanitized;
      let searchQuery = `part=snippet&type=video&maxResults=10&key=${apiKey}&q=${encodeURIComponent(sanitized)}&order=relevance&videoEmbeddable=true&videoSyndicated=true`;
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchQuery}`;
      const resp = await fetch(searchUrl);
      if (!resp.ok) return c.text('YouTube search temporarily unavailable', 503);

      const data = await resp.json();
      let results = sanitizeYouTubeResponse(data);

      // Ajouter les durées
      const videoIds = results.map(r => r.id).join(',');
      if (videoIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
        const detailsResp = await fetch(detailsUrl);
        if (detailsResp.ok) {
          const detailsData = await detailsResp.json();
          const durationMap = new Map<string, string>();
          detailsData.items?.forEach((item: any) => {
            if (item.id && item.contentDetails?.duration) {
              durationMap.set(item.id, item.contentDetails.duration);
            }
          });
          results = results.map(r => ({
            ...r,
            duration: durationMap.get(r.id) || 'PT0S'
          }));
        }
      }

      return c.json({ results });
    }
  } catch (error) {
    console.error('YouTube search error:', error);
    return c.text('Search failed. Please try again later.', 500);
  }
});


/**
 * Extract lyrics from YouTube video metadata
 * @route POST /lyrics/extract
 * @param {Object} request.body - Video metadata for lyrics extraction
 * @returns {Object} JSON response with extracted lyrics
 */
youtube.post('/lyrics/extract', async (c) => {
	const { videoId, title, channelTitle } = await c.req.json();

	if (!videoId || !title) {
		return c.text('Video ID and title are required', 400);
	}

	// Simple lyrics extraction from title patterns
	const extractedLyrics = extractLyricsFromTitle(title, channelTitle);

	return c.json({
		lyrics: extractedLyrics.lyrics,
		source: extractedLyrics.source,
		confidence: extractedLyrics.confidence,
	});
});

/**
 * Get YouTube metadata for a project
 * @route GET /youtube-metadata/:id
 * @param {string} id - Project ID
 * @returns {Object} YouTube metadata
 */
youtube.get('/youtube-metadata/:id', async (c) => {
	try {
		const projectId = c.req.param('id');
		
		const metadataJson = await c.env.PROJECT_KV.get(`youtube-meta:${projectId}`);
		if (!metadataJson) {
			return c.json({ error: 'YouTube metadata not found for this project' }, 404);
		}

		const metadata = JSON.parse(metadataJson);
		return c.json(metadata);
	} catch (error) {
		console.error('Error getting YouTube metadata:', error);
		return c.json({ error: 'Failed to get YouTube metadata' }, 500);
	}
});


export default youtube;
