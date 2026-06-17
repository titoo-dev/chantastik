import {
	NotFoundError,
	err,
	ok,
	type Lyrics,
	type ProjectId,
	type Result,
} from '../../domain/index.js';
import type { LyricsRepository, ProjectRepository } from '../ports/index.js';

export type GetLyricsDeps = {
	readonly projects: ProjectRepository;
	readonly lyrics: LyricsRepository;
};

/** Porte `GET /project/:id/lyrics`. */
export async function getLyrics(
	deps: GetLyricsDeps,
	projectId: ProjectId
): Promise<Result<Lyrics, NotFoundError>> {
	const project = await deps.projects.findById(projectId);
	if (!project) return err(new NotFoundError('Project', projectId));

	const lyrics = project.lyricsId
		? await deps.lyrics.findById(project.lyricsId)
		: await deps.lyrics.findByProject(projectId);

	if (!lyrics) return err(new NotFoundError('Lyrics', projectId));
	return ok(lyrics);
}
