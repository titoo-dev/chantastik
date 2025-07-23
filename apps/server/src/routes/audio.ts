import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { Audio, Bindings, Project } from '../types';
import { findFileByHash, generateFileHash, saveProject } from '../utils';
import * as mm from 'music-metadata';

const audio = new Hono<{
    Bindings: Bindings;
}>();


/**
 * Update an existing audio file
 * @route PUT /audio/:id
 * @param {string} request.params.id - The ID of the audio file to update
 * @param {FormData} request.body.file - The new MP3 file
 * @returns {Object} JSON response with update confirmation
 * @throws {404} If audio with given ID is not found
 * @throws {400} If no file is provided
 */
audio.put('/:id', async (c) => {
    const id = c.req.param('id');
    const existing = await c.env.AUDIO_FILES.get(`audio:${id}`);
    if (!existing) return c.text('Not found', 404);

    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return c.text('No file provided', 400);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
        return c.text(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`, 400);
    }
    const fileBuffer = await file.arrayBuffer();
    await c.env.AUDIO_FILES.put(`${id}.mp3`, fileBuffer, {
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

/**
 * Delete an audio file
 * @route DELETE /audio/:id
 * @param {string} request.params.id - The ID of the audio file to delete
 * @returns {Object} JSON response with deletion confirmation
 */
audio.delete('/:id', async (c) => {
    const id = c.req.param('id');

    await Promise.all([
        c.env.AUDIO_FILES.delete(`${id}.mp3`),
        c.env.AUDIO_KV.delete(`audio:${id}`),
    ]).catch((error) => {
        console.error('Error deleting audio:', error);
    });

    return c.json({ message: 'Deleted', id });
});


audio.get('/all', async (c) => {
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
audio.get('/:id/meta/:projectId', async (c) => {
  const id = c.req.param('id');
  const projectId = c.req.param('projectId');

  if (id.startsWith('youtube-virtual-')) {
    if (!projectId) return c.text('Missing projectId for YouTube project', 400);

    const youtubeMetaRaw = await c.env.PROJECT_KV.get(`youtube-meta:${projectId}`);
    if (!youtubeMetaRaw) return c.text('No YouTube metadata found', 404);

    const youtubeMeta = JSON.parse(youtubeMetaRaw);
    return c.json({
      id,
      title: youtubeMeta.title,
      artist: youtubeMeta.channelTitle,
      duration: youtubeMeta.parsedDuration,
      thumbnail: youtubeMeta.thumbnail,
      url: youtubeMeta.url,
      isVirtual: true,
    });
  }

  // 👉 Cas normal
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
audio.get('/:id', async (c) => {
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
        return c.body(object.body as ReadableStream<Uint8Array>, { headers });
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
    return c.body(rangeObject.body as ReadableStream<Uint8Array>, {
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
audio.get('/:id/cover/:projectId', async (c) => {
  const id = c.req.param('id');
  const projectId = c.req.param('projectId');
  // 👉 Special case: virtual YouTube project
  if (id.startsWith('youtube-virtual-')) {
    if (!projectId) return c.text('Missing projectId for YouTube project', 400);

    // On tente de récupérer l'image mise dans COVER_FILES
    const coverObject = await c.env.COVER_FILES.get(`cover:${projectId}`);
    if (coverObject) {
      return c.body(coverObject.body as ReadableStream<Uint8Array>, {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    // Sinon, fallback : lire la metadata et rediriger vers le thumbnail youtube
    const youtubeMetaRaw = await c.env.PROJECT_KV.get(`youtube-meta:${projectId}`);
    if (!youtubeMetaRaw) return c.text('No YouTube metadata found', 404);

    const youtubeMeta = JSON.parse(youtubeMetaRaw);
    if (youtubeMeta.thumbnail) {
      // redirige directement vers le lien du thumbnail
      return c.redirect(youtubeMeta.thumbnail, 302);
    }

    return c.text('No thumbnail available for this YouTube project', 404);
  }

  const raw = await c.env.AUDIO_KV.get(`audio:${id}`);
  if (!raw) return c.text('Audio file not found', 404);

  const meta = JSON.parse(raw) as Audio;

  if (!meta.coverArt || !meta.coverArt.id) {
    return c.text('No cover art available for this audio', 404);
  }

  const coverArtFormat = meta.coverArt.format.split('/')[1] || 'jpg';
  const coverKey = `${meta.coverArt.id}.${coverArtFormat}`;

  const coverObject = await c.env.COVER_FILES.get(coverKey);
  if (!coverObject) return c.text('Cover art file not found', 404);

  return c.body(coverObject.body as ReadableStream<Uint8Array>, {
    headers: {
      'Content-Type': meta.coverArt.format || 'image/jpeg',
    },
  });
});

/**
 * Upload a new MP3 audio file
 * @route POST /audio
 * @param {FormData} request.body.audio - The MP3 file to upload
 * @returns {Object} JSON response with upload ID
 * @throws {400} If no file is provided or file type is invalid
 */
audio.post('/', async (c) => {
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
            const coverKey = `${coverArtId}.${coverArt.format.split('/')[1] || 'jpg'
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
            `Error extracting metadata: ${error instanceof Error ? error.message : String(error)
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
        name: `${meta.metadata?.title || 'New Project'} - ${meta.metadata?.artist || 'Unknown Artist'
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

export default audio;
