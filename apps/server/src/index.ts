import { Hono } from 'hono';
import { File } from '@cloudflare/workers-types';
import { v4 as uuidv4 } from 'uuid';
import * as mm from 'music-metadata';
import { cors } from 'hono/cors';
import { Audio, Bindings, Lyrics, Project } from './types';
import { findFileByHash, generateFileHash, saveProject, sanitizeSearchQuery, checkRateLimit, sanitizeYouTubeResponse, calculateTitleMatchScore } from './utils';

const app = new Hono<{
	Bindings: Bindings;
}>();

app.use('*', cors({
	origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-production-domain.com'],
	credentials: true
}));

/**
 * Upload a new MP3 audio file
 * @route POST /audio
 * @param {FormData} request.body.audio - The MP3 file to upload
 * @returns {Object} JSON response with upload ID
 * @throws {400} If no file is provided or file type is invalid
 */
app.post('/audio', async (c) => {
	const contentType = c.req.header('content-type') || '';

	if (!contentType.includes('multipart/form-data')) {
		return c.text('Expected multipart/form-data', 400);
	}

	const formData = await c.req.formData();
	const file = formData.get('audio');

	if (!file || typeof file === 'string') {
		return c.text('No Audio uploaded', 400);
	}

	if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
		return c.text('Invalid file type', 400);
	}

	// We need to clone the file for metadata extraction since we'll consume the stream later
	const fileBuffer = await file.arrayBuffer();
	// Convert ArrayBuffer to Uint8Array for music-metadata parsing
	const uint8Array = new Uint8Array(fileBuffer);

	// Generate a hash of the file content
	const fileHash = await generateFileHash(uint8Array);

	// Check if a file with the same hash already exists
	const existingFile = await findFileByHash(c.env.AUDIO_KV, fileHash);

	if (existingFile) {
		// Return information about the existing file instead of creating a duplicate
		return c.json(
			{
				message: 'File already exists',
				duplicate: true,
				existingFile: {
					id: existingFile.id,
					filename: existingFile.filename,
					metadata: existingFile.metadata,
				},
			},
			400
		);
	}

	const audioId = uuidv4();
	const key = `${audioId}.mp3`;

	// Extract metadata using music-metadata
	let metadata;
	let coverArtInfo;

	try {
		metadata = await mm.parseBuffer(uint8Array, { mimeType: file.type });

		// Check if there's cover art in the file
		if (metadata.common.picture && metadata.common.picture.length > 0) {
			const coverArt = metadata.common.picture[0];
			const coverArtId = `${audioId}-cover`;
			const coverKey = `${coverArtId}.${
				coverArt.format.split('/')[1] || 'jpg'
			}`;

			// Save cover art to R2
			await c.env.COVER_FILES.put(coverKey, coverArt.data, {
				httpMetadata: {
					contentType: coverArt.format,
				},
			});

			coverArtInfo = {
				id: coverArtId,
				format: coverArt.format,
				size: coverArt.data.length,
			};
		}
	} catch (error) {
		return c.text(
			`Error extracting metadata: ${
				error instanceof Error ? error.message : String(error)
			}`,
			500
		);
	}

	// Save to R2
	await c.env.AUDIO_FILES.put(key, new Uint8Array(fileBuffer), {
		httpMetadata: {
			contentType: file.type,
		},
	});

	const meta: Audio = {
		id: audioId,
		filename: file.name,
		contentType: file.type,
		size: file.size,
		fileHash: fileHash, // Store the hash for future duplicate checks
		createdAt: new Date().toISOString(),
		metadata: metadata
			? {
					title: metadata.common.title,
					artist: metadata.common.artist,
					album: metadata.common.album,
					year: metadata.common.year?.toString(),
					genre: metadata.common.genre,
					duration: metadata.format.duration,
				}
			: undefined,
		coverArt: coverArtInfo,
	};

	await c.env.AUDIO_KV.put(`audio:${audioId}`, JSON.stringify(meta));

	// create project
	const projectId = uuidv4();
	const now = new Date().toISOString();

	const project: Project = {
		id: projectId,
		name: `${meta.metadata?.title || 'New Project'} - ${
			meta.metadata?.artist || 'Unknown Artist'
		}`,
		createdAt: now,
		updatedAt: now,
		audioId: audioId,
	};

	await saveProject(c.env.PROJECT_KV, project);

	return c.json({
		message: 'Uploaded',
		projectId: projectId,
		audioMetadata: meta,
	});
});

/**
 * Save or update lyrics for a project
 * @route POST /project/:id/lyrics
 * @param {string} request.params.id - The project ID
 * @param {Object} request.body - Lyrics data containing text and lines
 * @returns {Object} JSON response with lyrics ID and confirmation
 * @throws {404} If project is not found
 * @throws {400} If required data is missing
 */
app.post('/project/:id/lyrics', async (c) => {
	const projectId = c.req.param('id');

	// Verify project exists
	const projectRaw = await c.env.PROJECT_KV.get(`project:${projectId}`);
	if (!projectRaw) return c.text('Project not found', 404);

	const { text, lines } = await c.req.json();

	if (!text && !lines) {
		return c.text('Text or lines are required', 400);
	}

	const lyricsId = uuidv4();
	const now = new Date().toISOString();

	const lyrics: Lyrics = {
		id: lyricsId,
		createdAt: now,
		updatedAt: now,
		text: text || '',
		projectId: projectId,
		lines: lines || [],
	};

	await c.env.LYRICS_KV.put(`lyrics:${lyricsId}`, JSON.stringify(lyrics));

	// Update project with lyrics reference
	const project = JSON.parse(projectRaw);
	project.lyricsId = lyricsId;
	project.updatedAt = now;
	await saveProject(c.env.PROJECT_KV, project);

	return c.json({
		message: 'Lyrics saved successfully',
		lyricsId: lyricsId,
		projectId: projectId,
	});
});

/**
 * Get lyrics for a project
 * @route GET /project/:id/lyrics
 * @param {string} request.params.id - The project ID
 * @returns {Object} JSON response with lyrics data
 * @throws {404} If project or lyrics not found
 */
app.get('/project/:id/lyrics', async (c) => {
	const projectId = c.req.param('id');

	// Get project to find lyrics ID
	const projectRaw = await c.env.PROJECT_KV.get(`project:${projectId}`);
	if (!projectRaw) return c.text('Project not found', 404);

	const project = JSON.parse(projectRaw);
	if (!project.lyricsId)
		return c.text('No lyrics found for this project', 404);

	const lyricsRaw = await c.env.LYRICS_KV.get(`lyrics:${project.lyricsId}`);
	if (!lyricsRaw) return c.text('Lyrics not found', 404);

	return c.json(JSON.parse(lyricsRaw));
});

/**
 * Get a list of all uploaded audio files
 * @route GET /audios
 * @returns {Object} JSON response with array of audio metadata
 */
app.get('/audios', async (c) => {
	const { keys } = await c.env.AUDIO_KV.list({ prefix: 'audio:' });

	if (keys.length === 0) {
		return c.json({ audios: [] });
	}

	const audioMetas = await Promise.all(
		keys.map(async ({ name }) => {
			const raw = await c.env.AUDIO_KV.get(name);
			if (!raw) return null;
			return JSON.parse(raw) as Audio;
		})
	);

	// Filter out any null values (in case a KV read failed)
	const validAudios = audioMetas.filter((meta) => meta !== null);

	return c.json({ audios: validAudios });
});

/**
 * Get metadata for a specific audio file
 * @route GET /audio/:id/meta
 * @param {string} request.params.id - The ID of the audio file
 * @returns {Object} JSON response with audio metadata
 * @throws {404} If audio with given ID is not found
 */
app.get('/audio/:id/meta', async (c) => {
	const id = c.req.param('id');
	const raw = await c.env.AUDIO_KV.get(`audio:${id}`);
	if (!raw) return c.text('Not found', 404);

	return c.json(JSON.parse(raw));
});

/**
 * Stream an audio file with range request support
 * @route GET /audio/:id
 * @param {string} request.params.id - The ID of the audio file
 * @returns {Stream} Audio file stream with appropriate content-type
 * @throws {404} If audio file is not found
 */
app.get('/audio/:id', async (c) => {
	const id = c.req.param('id');
	const object = await c.env.AUDIO_FILES.get(`${id}.mp3`);
	if (!object) return c.text('File not found', 404);

	const rangeHeader = c.req.header('range');
	const contentType = object.httpMetadata?.contentType || 'audio/mpeg';
	const size = object.size;

	// Set default headers
	const headers: { [key: string]: string } = {
		'Content-Type': contentType,
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'public, max-age=3600',
	};

	// If no range is requested, return the entire file
	if (!rangeHeader) {
		headers['Content-Length'] = size.toString();
		return c.body(object.body, { headers });
	}

	// Parse the range header
	const rangeParts = rangeHeader.replace(/bytes=/, '').split('-');
	const start = parseInt(rangeParts[0], 10);
	const end = rangeParts[1] ? parseInt(rangeParts[1], 10) : size - 1;

	// Check if the range is valid
	if (isNaN(start) || isNaN(end) || start >= size || end >= size) {
		// Return 416 Range Not Satisfiable if range is invalid
		headers['Content-Range'] = `bytes */${size}`;
		return c.body(null, {
			status: 416, // Range Not Satisfiable
			headers,
		});
	}

	// Calculate the chunk size
	const chunkSize = end - start + 1;

	// Get the requested range from R2
	const rangeObject = await c.env.AUDIO_FILES.get(`${id}.mp3`, {
		range: { offset: start, length: chunkSize },
	});

	if (!rangeObject) return c.text('Range not available', 416);

	// Set additional headers for partial content
	headers['Content-Length'] = chunkSize.toString();
	headers['Content-Range'] = `bytes ${start}-${end}/${size}`;

	// Return 206 Partial Content for range requests
	return c.body(rangeObject.body, {
		status: 206, // Partial Content
		headers,
	});
});

/**
 * Get cover art for an audio file
 * @route GET /audio/:id/cover
 * @param {string} request.params.id - The ID of the audio file
 * @returns {Stream} Cover art image stream with appropriate content-type
 * @throws {404} If cover art is not found
 */
app.get('/audio/:id/cover', async (c) => {
	const id = c.req.param('id');

	// Get audio metadata to check if it has cover art
	const raw = await c.env.AUDIO_KV.get(`audio:${id}`);
	if (!raw) return c.text('Audio file not found', 404);

	const meta = JSON.parse(raw) as Audio;

	// Check if this audio file has cover art
	if (!meta.coverArt || !meta.coverArt.id) {
		return c.text('No cover art available for this audio', 404);
	}

	// Construct the cover art key based on the format
	const coverArtFormat = meta.coverArt.format.split('/')[1] || 'jpg';
	const coverKey = `${meta.coverArt.id}.${coverArtFormat}`;

	// Get the cover art from R2
	const coverObject = await c.env.COVER_FILES.get(coverKey);
	if (!coverObject) return c.text('Cover art file not found', 404);

	// Return the cover art with proper content type
	return c.body(coverObject.body, {
		headers: {
			'Content-Type': meta.coverArt.format || 'image/jpeg',
		},
	});
});

app.get('/projects', async (c) => {
	const keys = await c.env.PROJECT_KV.list({ prefix: 'project:' });

	if (!keys.keys.length) return c.json({ projects: [] });

	const projects = await Promise.all(
		keys.keys.map(async (key) => {
			const raw = await c.env.PROJECT_KV.get(key.name);
			return raw ? JSON.parse(raw) : null;
		})
	);

	return c.json(projects.filter((p) => p !== null));
});

app.get('/project/:id', async (c) => {
	const id = c.req.param('id');
	const raw = await c.env.PROJECT_KV.get(`project:${id}`);
	if (!raw) return c.text('Project not found', 404);
	return c.json(JSON.parse(raw));
});

app.post('/project', async (c) => {
	const { name, audioId } = await c.req.json();

	const id = uuidv4();
	const now = new Date().toISOString();
	const project: Project = {
		id,
		name,
		createdAt: now,
		updatedAt: now,
		audioId,
	};

	await saveProject(c.env.PROJECT_KV, project);

	return c.json({ message: 'Project created', id });
});

app.put('/project/:id', async (c) => {
	const id = c.req.param('id');
	const raw = await c.env.PROJECT_KV.get(`project:${id}`);
	if (!raw) return c.text('Project not found', 404);

	const project = JSON.parse(raw);
	const updates = await c.req.json();

	// Handle lyrics if provided
	if (updates.lyrics) {
		const lyricsId = uuidv4();
		const now = new Date().toISOString();
		const lyrics: Lyrics = {
			id: lyricsId,
			createdAt: now,
			updatedAt: now,
			text: updates.lyrics.text || '',
			projectId: id,
			lines: updates.lyrics.lines || [],
		};

		await c.env.LYRICS_KV.put(`lyrics:${lyricsId}`, JSON.stringify(lyrics));

		// Remove lyrics from updates to avoid storing in project
		delete updates.lyrics;
	}

	// Apply other changes
	Object.assign(project, updates);
	await saveProject(c.env.PROJECT_KV, project);

	return c.json({ message: 'Project updated', project });
});

/**
 * Update an existing audio file
 * @route PUT /audio/:id
 * @param {string} request.params.id - The ID of the audio file to update
 * @param {FormData} request.body.file - The new MP3 file
 * @returns {Object} JSON response with update confirmation
 * @throws {404} If audio with given ID is not found
 * @throws {400} If no file is provided
 */
app.put('/audio/:id', async (c) => {
	const id = c.req.param('id');
	const existing = await c.env.AUDIO_FILES.get(`audio:${id}`);
	if (!existing) return c.text('Not found', 404);

	const formData = await c.req.formData();
	const file = formData.get('file') as File;
	if (!file) return c.text('No file provided', 400);

	await c.env.AUDIO_FILES.put(`${id}.mp3`, file.stream(), {
		httpMetadata: { contentType: file.type },
	});

	const existingMetaRaw = await existing.text();

	const meta: Audio = {
		...(JSON.parse(existingMetaRaw) as Audio),
		filename: file.name,
		contentType: file.type,
		size: file.size,
		createdAt: new Date().toISOString(), // or keep original
	};

	await c.env.AUDIO_FILES.put(`audio:${id}`, JSON.stringify(meta));

	return c.json({ message: 'Updated', id });
});

app.delete('/project/:id', async (c) => {
	const id = c.req.param('id');
	const rawProject = await c.env.PROJECT_KV.get(`project:${id}`);
	if (!rawProject) return c.text('Project not found', 404);

	const project = JSON.parse(rawProject);

	const rawAudio = await c.env.AUDIO_KV.get(`audio:${project.audioId}`);

	if (!rawAudio) return c.text('Audio not found', 404);

	const audio = JSON.parse(rawAudio);

	await c.env.PROJECT_KV.delete(`project:${id}`);
	await c.env.AUDIO_KV.delete(`audio:${audio.id}`);

	await c.env.AUDIO_FILES.delete(`${audio.id}.mp3`);

	const coverKey = `${audio.coverArt.id}.${
		audio.coverArt.format.split('/')[1] || 'jpg'
	}`;

	await c.env.COVER_FILES.delete(coverKey);

	return c.json({ message: 'Project deleted', id });
});

/**
 * Delete an audio file
 * @route DELETE /audio/:id
 * @param {string} request.params.id - The ID of the audio file to delete
 * @returns {Object} JSON response with deletion confirmation
 */
app.delete('/audio/:id', async (c) => {
	const id = c.req.param('id');

	await Promise.all([
		c.env.AUDIO_FILES.delete(`${id}.mp3`),
		c.env.AUDIO_KV.delete(`audio:${id}`),
	]);

	return c.json({ message: 'Deleted', id });
});

/**
 * Search YouTube for videos with security measures
 * @route GET /youtube/search
 * @param {string} request.query.q - The search query
 * @param {string} request.query.title - Optional: Search specifically in video titles
 * @param {string} request.query.type - Optional: Search type ('general' or 'title'), defaults to 'general'
 * @returns {Object} JSON response with search results
 * @throws {400} If query parameter is missing or invalid
 * @throws {429} If rate limit exceeded
 * @throws {500} If YouTube API key is not configured or API request fails
 */
app.get('/youtube/search', async (c) => {
	const query = c.req.query('q');
	const titleQuery = c.req.query('title');
	const searchType = c.req.query('type') || 'general';
	
	// Determine which query to use
	const searchQuery = titleQuery || query;
	
	// Input validation and sanitization
	const { isValid, sanitized, error } = sanitizeSearchQuery(searchQuery || '');
	if (!isValid) {
		return c.text(error || 'Invalid query', 400);
	}

	// Rate limiting
	const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
	const { allowed } = await checkRateLimit(c.env.AUDIO_KV, `youtube:${clientIP}`, 10, 60);
	
	if (!allowed) {
		return c.text('Rate limit exceeded. Please try again later.', 429);
	}

	try {
		const apiKey = c.env.YOUTUBE_API_KEY;
		if (!apiKey) {
			return c.text('YouTube API key not configured', 500);
		}

		// Search for videos with different strategies based on search type
		let searchQueryString = `part=snippet&type=video&maxResults=10&key=${apiKey}`;
		
		if (titleQuery || searchType === 'title') {
			// For title search, prioritize title matches but don't require exact match
			// Use a combination of strategies for better title-focused results
			const titleSearchTerms = sanitized.split(' ').filter(term => term.length > 2);
			if (titleSearchTerms.length > 0) {
				// Search for terms that are likely to appear in titles
				const titleQuery = titleSearchTerms.map(term => `"${term}"`).join(' ');
				searchQueryString += `&q=${encodeURIComponent(titleQuery)}`;
			} else {
				searchQueryString += `&q=${encodeURIComponent(sanitized)}`;
			}
			// Add relevance ordering to prioritize title matches
			searchQueryString += '&order=relevance';
		} else {
			// For general search, use standard query
			searchQueryString += `&q=${encodeURIComponent(sanitized)}`;
			searchQueryString += '&order=relevance';
		}
		
		// Add additional filters for better results
		searchQueryString += '&videoEmbeddable=true&videoSyndicated=true';
		
		const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchQueryString}`;
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);
		
		const response = await fetch(searchUrl, { 
			signal: controller.signal,
			headers: { 'User-Agent': 'Chantastik/1.0', 'Accept': 'application/json' }
		});
		
		clearTimeout(timeoutId);
		
		if (!response.ok) {
			console.error('YouTube API error:', response.status);
			return c.text('YouTube search temporarily unavailable', 503);
		}

		const data = await response.json();
		let results = sanitizeYouTubeResponse(data);
		
		// For title search, re-rank results to prioritize title matches
		if (titleQuery || searchType === 'title') {
			results = results.sort((a, b) => {
				const searchTerms = sanitized.toLowerCase().split(' ').filter(term => term.length > 1);
				
				// Calculate title match score
				const scoreA = calculateTitleMatchScore(a.title, searchTerms);
				const scoreB = calculateTitleMatchScore(b.title, searchTerms);
				
				return scoreB - scoreA; // Higher score first
			});
		}
		
		if (results.length === 0) {
			return c.json({ results: [] });
		}
		
		// Get video details for duration
		const videoIds = results.map(r => r.id).join(',');
		const detailsQuery = `part=contentDetails&id=${encodeURIComponent(videoIds)}&key=${apiKey}`;
		const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsQuery}`;

		const detailsController = new AbortController();
		const detailsTimeoutId = setTimeout(() => detailsController.abort(), 10000);

		const detailsResponse = await fetch(detailsUrl, { 
			signal: detailsController.signal,
			headers: { 'User-Agent': 'Chantastik/1.0', 'Accept': 'application/json' }
		});
		
		clearTimeout(detailsTimeoutId);
		
		// Add duration to results
		if (detailsResponse.ok) {
			const detailsData = await detailsResponse.json();
			const durationMap = new Map();
			
			detailsData.items?.forEach((item: any) => {
				if (item.id && item.contentDetails?.duration) {
					durationMap.set(item.id, item.contentDetails.duration);
				}
			});
			
			results.forEach(result => {
				result.duration = durationMap.get(result.id) || 'PT0S';
			});
		}

		return c.json({ results });
	} catch (error) {
		console.error('YouTube search error:', error);
		
		if (error instanceof Error && error.name === 'AbortError') {
			return c.text('Request timeout', 408);
		}
		
		return c.text('Search failed. Please try again later.', 500);
	}
});

/**
 * Create a project from YouTube video metadata without downloading audio
 * @route POST /project/from-youtube
 * @param {Object} request.body - YouTube video metadata
 * @returns {Object} JSON response with project ID
 */
app.post('/project/from-youtube', async (c) => {
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

/**
 * Extract lyrics from YouTube video metadata
 * @route POST /lyrics/extract
 * @param {Object} request.body - Video metadata for lyrics extraction
 * @returns {Object} JSON response with extracted lyrics
 */
app.post('/lyrics/extract', async (c) => {
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
 * @route GET /project/:id/youtube-metadata
 * @param {string} id - Project ID
 * @returns {Object} YouTube metadata
 */
app.get('/project/:id/youtube-metadata', async (c) => {
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

/**
 * Helper function to parse YouTube duration to seconds
 */
function parseDurationToSeconds(duration: string): number {
	if (!duration) return 0;
	
	// Parse ISO 8601 duration format (PT4M13S)
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;

	const hours = parseInt(match[1] || '0');
	const minutes = parseInt(match[2] || '0');
	const seconds = parseInt(match[3] || '0');

	return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Helper function to extract lyrics from video title
 */
function extractLyricsFromTitle(title: string, channelTitle: string): {
	lyrics: string[];
	source: 'title' | 'description' | 'external' | 'none';
	confidence: number;
} {
	// Common patterns in music video titles
	const lyricsPatterns = [
		/lyrics/i,
		/lyric video/i,
		/official lyric/i,
		/with lyrics/i,
		/\(lyrics\)/i,
		/\[lyrics\]/i,
	];

	const hasLyricsPattern = lyricsPatterns.some(pattern => pattern.test(title));
	
	if (hasLyricsPattern) {
		// Extract potential song structure from title
		const cleanTitle = title
			.replace(/\(.*lyrics.*\)/gi, '')
			.replace(/\[.*lyrics.*\]/gi, '')
			.replace(/- lyrics/gi, '')
			.replace(/lyrics -/gi, '')
			.replace(/official lyric video/gi, '')
			.trim();

		// Create basic lyric structure based on title
		const potentialLyrics = [
			"[Verse 1]",
			cleanTitle,
			"",
			"[Chorus]",
			cleanTitle,
			"",
			"[Verse 2]",
			"(Add lyrics here)",
			"",
			"[Chorus]",
			cleanTitle,
		];

		return {
			lyrics: potentialLyrics,
			source: 'title',
			confidence: 0.7,
		};
	}

	// Check if it's likely a music video
	const musicPatterns = [
		/official music video/i,
		/official video/i,
		/music video/i,
		/(song|track|single|album)/i,
	];

	const isMusicVideo = musicPatterns.some(pattern => pattern.test(title));
	
	if (isMusicVideo) {
		const songTitle = title
			.replace(/official music video/gi, '')
			.replace(/official video/gi, '')
			.replace(/music video/gi, '')
			.trim();

		return {
			lyrics: [
				"[Verse 1]",
				songTitle,
				"",
				"[Chorus]",
				"(Add lyrics here)",
				"",
				"[Verse 2]",
				"(Add lyrics here)",
			],
			source: 'title',
			confidence: 0.5,
		};
	}

	return {
		lyrics: [],
		source: 'none',
		confidence: 0,
	};
}
