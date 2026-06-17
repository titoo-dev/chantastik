import { describe, it, expect } from 'vitest';
import { AudioId, CoverId, ProjectId, type Audio, type Project } from '../../domain/index.js';
import {
	FixedClock,
	InMemoryAudioRepository,
	InMemoryBlobStorage,
	InMemoryProjectRepository,
} from '../../testing/index.js';
import { deleteProject } from './delete-project.js';

describe('deleteProject (cascade)', () => {
	it('supprime projet + audio + blob + cover', async () => {
		const projects = new InMemoryProjectRepository();
		const audio = new InMemoryAudioRepository();
		const audioFiles = new InMemoryBlobStorage();
		const coverFiles = new InMemoryBlobStorage();
		const now = new FixedClock().now();

		const audioId = AudioId('a1');
		const projectId = ProjectId('p1');
		const audioEntity: Audio = {
			id: audioId,
			filename: 'x.mp3',
			contentType: 'audio/mpeg',
			size: 1,
			fileHash: 'h',
			createdAt: now,
			coverArt: { id: CoverId('c1'), format: 'image/jpeg', size: 1 },
		};
		const project: Project = {
			id: projectId,
			name: 'P',
			audioId,
			createdAt: now,
			updatedAt: now,
		};
		await audio.save(audioEntity);
		await projects.save(project);
		await audioFiles.put(`${audioId}.mp3`, new ArrayBuffer(1));
		await coverFiles.put('c1.jpeg', new ArrayBuffer(1));

		const r = await deleteProject(
			{ projects, audio, audioFiles, coverFiles },
			projectId
		);

		expect(r.ok).toBe(true);
		expect(await projects.findById(projectId)).toBeNull();
		expect(await audio.findById(audioId)).toBeNull();
		expect(audioFiles.store.size).toBe(0);
		expect(coverFiles.store.size).toBe(0);
	});

	it('échoue (NotFound) si le projet est absent', async () => {
		const r = await deleteProject(
			{
				projects: new InMemoryProjectRepository(),
				audio: new InMemoryAudioRepository(),
				audioFiles: new InMemoryBlobStorage(),
				coverFiles: new InMemoryBlobStorage(),
			},
			ProjectId('nope')
		);
		expect(r.ok).toBe(false);
	});
});
