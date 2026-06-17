import { describe, it, expect } from 'vitest';
import { isErr, isOk, ProjectId } from '../../domain/index.js';
import {
	FixedClock,
	InMemoryLyricsRepository,
	InMemoryProjectRepository,
	SequentialIdGenerator,
} from '../../testing/index.js';
import { createProject } from './create-project.js';
import { saveLyrics } from './save-lyrics.js';
import { parseLrc } from '../../domain/lyrics/lrc.js';

const buildDeps = () => ({
	projects: new InMemoryProjectRepository(),
	lyrics: new InMemoryLyricsRepository(),
	clock: new FixedClock(),
	ids: new SequentialIdGenerator(),
});

describe('saveLyrics (use case, sans infrastructure)', () => {
	it('persiste les lyrics et met à jour la référence du projet', async () => {
		const deps = buildDeps();
		const created = await createProject(deps, { name: 'Mon morceau' });
		expect(isOk(created)).toBe(true);
		if (!created.ok) return;

		const lines = parseLrc('[00:01.00] Bonjour\n[00:03.50] le monde');
		const result = await saveLyrics(deps, {
			projectId: created.value.id,
			text: 'Bonjour\nle monde',
			lines,
		});

		expect(isOk(result)).toBe(true);
		if (!result.ok) return;
		expect(result.value.lines).toHaveLength(2);
		expect(result.value.lines[0]?.timestamp).toBe(1);

		const project = await deps.projects.findById(created.value.id);
		expect(project?.lyricsId).toBe(result.value.id);
	});

	it('échoue (NotFound) si le projet est inconnu', async () => {
		const deps = buildDeps();
		const result = await saveLyrics(deps, {
			projectId: ProjectId('inexistant'),
			text: 'x',
			lines: [],
		});
		expect(isErr(result)).toBe(true);
		if (result.ok) return;
		expect(result.error.code).toBe('NOT_FOUND');
	});

	it('échoue (Validation) si ni texte ni lignes', async () => {
		const deps = buildDeps();
		const created = await createProject(deps, { name: 'Vide' });
		if (!created.ok) return;
		const result = await saveLyrics(deps, {
			projectId: created.value.id,
			text: '',
			lines: [],
		});
		expect(isErr(result)).toBe(true);
		if (result.ok) return;
		expect(result.error.code).toBe('VALIDATION');
	});
});
