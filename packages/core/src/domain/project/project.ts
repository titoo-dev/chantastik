import { ValidationError } from '../shared/result.js';
import type {
	AudioId,
	IsoTimestamp,
	LyricsId,
	ProjectId,
} from '../shared/identifiers.js';

/**
 * `Project` — agrégat racine. Référence l'audio et les lyrics par leur id
 * (les autres agrégats ne sont pas embarqués).
 */
export type Project = {
	readonly id: ProjectId;
	readonly name: string;
	readonly description?: string;
	readonly createdAt: IsoTimestamp;
	readonly updatedAt: IsoTimestamp;
	readonly audioId?: AudioId;
	readonly lyricsId?: LyricsId;
	readonly assetIds?: readonly string[];
	readonly metadata?: {
		readonly tags?: readonly string[];
		readonly category?: string;
		readonly link?: string;
		readonly public?: boolean;
	};
};

const MAX_NAME_LENGTH = 120;

/** Invariant : un projet a un nom non vide et borné. */
export function assertValidProjectName(name: string): void {
	const trimmed = name.trim();
	if (trimmed.length === 0) {
		throw new ValidationError('Le nom du projet est requis.');
	}
	if (trimmed.length > MAX_NAME_LENGTH) {
		throw new ValidationError(
			`Le nom du projet dépasse ${MAX_NAME_LENGTH} caractères.`
		);
	}
}

export const hasAudio = (project: Project): boolean =>
	project.audioId !== undefined;
