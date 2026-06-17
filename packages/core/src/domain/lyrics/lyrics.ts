import type { IsoTimestamp, LyricsId, ProjectId } from '../shared/identifiers.js';

/**
 * Une ligne de paroles. Type UNIFIÉ : côté client actuel `style` n'existait
 * pas, côté serveur si — on retient la version riche comme source de vérité.
 */
export type LyricLine = {
	readonly id: number;
	readonly text: string;
	/** Position temporelle (secondes) une fois synchronisée. */
	readonly timestamp?: number;
	readonly style?: {
		readonly emphasis?: boolean;
		readonly volume?: 'soft' | 'normal' | 'loud';
		/** Durée d'affichage de la ligne (secondes). */
		readonly duration?: number;
	};
};

export type LyricsSource = 'manual' | 'imported' | 'generated';

export type Lyrics = {
	readonly id: LyricsId;
	readonly projectId: ProjectId;
	readonly text: string;
	readonly lines: readonly LyricLine[];
	readonly createdAt: IsoTimestamp;
	readonly updatedAt: IsoTimestamp;
	readonly metadata?: {
		readonly language?: string;
		readonly source?: LyricsSource;
		readonly confidence?: number;
		readonly version?: number;
	};
};

/** Une ligne est considérée synchronisée si elle porte un timestamp. */
export const isLineSynced = (line: LyricLine): boolean =>
	typeof line.timestamp === 'number';

/** Proportion [0,1] de lignes synchronisées — invariant utile pour l'UI/use cases. */
export const syncProgress = (lyrics: Pick<Lyrics, 'lines'>): number => {
	if (lyrics.lines.length === 0) return 0;
	const synced = lyrics.lines.filter(isLineSynced).length;
	return synced / lyrics.lines.length;
};
