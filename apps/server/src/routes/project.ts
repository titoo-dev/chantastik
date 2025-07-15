import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';

import { Bindings, Lyrics, Project } from '../types';
import { saveProject } from '../utils';

const project = new Hono<{
    Bindings: Bindings;
}>();



/**
 * Save or update lyrics for a project
 * @route POST /project/:id/lyrics
 * @param {string} request.params.id - The project ID
 * @param {Object} request.body - Lyrics data containing text and lines
 * @returns {Object} JSON response with lyrics ID and confirmation
 * @throws {404} If project is not found
 * @throws {400} If required data is missing
 */
project.post('/:id/lyrics', async (c) => {
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
project.get('/:id/lyrics', async (c) => {
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
project.get('/all', async (c) => {
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

project.get('/:id', async (c) => {
	const id = c.req.param('id');
	const raw = await c.env.PROJECT_KV.get(`project:${id}`);
	if (!raw) return c.text('Project not found', 404);
	return c.json(JSON.parse(raw));
});

project.post('/', async (c) => {
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

project.put('/:id', async (c) => {
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


project.delete('/:id', async (c) => {
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

export default project;