import {
	LyricsId,
	NotFoundError,
	ValidationError,
	ok,
	err,
	type Lyrics,
	type LyricLine,
	type ProjectId,
	type Project,
	type Result,
} from '../../domain/index.js';
import type {
	Clock,
	IdGenerator,
	LyricsRepository,
	ProjectRepository,
} from '../ports/index.js';

export type SaveLyricsDeps = {
	readonly projects: ProjectRepository;
	readonly lyrics: LyricsRepository;
	readonly clock: Clock;
	readonly ids: IdGenerator;
};

export type SaveLyricsInput = {
	readonly projectId: ProjectId;
	readonly text: string;
	readonly lines: readonly LyricLine[];
};

/**
 * Use case `saveLyrics`. Porte la logique de la route Hono
 * `POST /project/:id/lyrics` : vérifie l'existence du projet, persiste les
 * lyrics, met à jour la référence `lyricsId` du projet.
 */
export async function saveLyrics(
	deps: SaveLyricsDeps,
	input: SaveLyricsInput
): Promise<Result<Lyrics, ValidationError | NotFoundError>> {
	if (!input.text && input.lines.length === 0) {
		return err(new ValidationError('Texte ou lignes requis.'));
	}

	const project = await deps.projects.findById(input.projectId);
	if (!project) {
		return err(new NotFoundError('Project', input.projectId));
	}

	const now = deps.clock.now();
	const lyrics: Lyrics = {
		id: LyricsId(deps.ids.generate()),
		projectId: input.projectId,
		text: input.text,
		lines: input.lines,
		createdAt: now,
		updatedAt: now,
	};

	await deps.lyrics.save(lyrics);

	const updatedProject: Project = {
		...project,
		lyricsId: lyrics.id,
		updatedAt: now,
	};
	await deps.projects.save(updatedProject);

	return ok(lyrics);
}
