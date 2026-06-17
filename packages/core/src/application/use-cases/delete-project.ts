import {
	NotFoundError,
	err,
	ok,
	type ProjectId,
	type Result,
} from '../../domain/index.js';
import type {
	AudioRepository,
	BlobStorage,
	ProjectRepository,
} from '../ports/index.js';

export type DeleteProjectDeps = {
	readonly projects: ProjectRepository;
	readonly audio: AudioRepository;
	readonly audioFiles: BlobStorage;
	readonly coverFiles: BlobStorage;
};

const coverExtension = (format: string): string =>
	format.split('/')[1] ?? 'jpg';

/**
 * Porte `DELETE /project/:id` avec CASCADE : supprime le projet, son audio
 * (métadonnées + blob R2) et la cover associée. Tolérant à l'absence d'audio
 * (un projet peut ne pas en avoir, contrairement à l'implémentation Hono qui
 * renvoyait 404 — comportement corrigé ici).
 */
export async function deleteProject(
	deps: DeleteProjectDeps,
	id: ProjectId
): Promise<Result<{ id: ProjectId }, NotFoundError>> {
	const project = await deps.projects.findById(id);
	if (!project) return err(new NotFoundError('Project', id));

	if (project.audioId) {
		const audio = await deps.audio.findById(project.audioId);
		await deps.audio.delete(project.audioId);
		await deps.audioFiles.delete(`${project.audioId}.mp3`);
		if (audio?.coverArt) {
			await deps.coverFiles.delete(
				`${audio.coverArt.id}.${coverExtension(audio.coverArt.format)}`
			);
		}
	}

	await deps.projects.delete(id);
	return ok({ id });
}
