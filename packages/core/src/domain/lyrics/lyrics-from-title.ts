import type { LyricsSource } from './lyrics.js';

/**
 * Heuristique PURE de génération d'une trame de paroles à partir d'un titre
 * de vidéo — rapatriée de `apps/server/src/utils.ts::extractLyricsFromTitle`.
 * Renvoie des lignes brutes + une source + un niveau de confiance.
 */
export type LyricsDraft = {
	readonly lines: readonly string[];
	readonly source: Extract<LyricsSource, 'imported'> | 'title' | 'none';
	readonly confidence: number;
};

const LYRICS_PATTERNS: readonly RegExp[] = [
	/lyrics/i,
	/lyric video/i,
	/official lyric/i,
	/with lyrics/i,
	/\(lyrics\)/i,
	/\[lyrics\]/i,
];

const MUSIC_VIDEO_PATTERNS: readonly RegExp[] = [
	/official music video/i,
	/official video/i,
	/music video/i,
	/(song|track|single|album)/i,
];

export function draftLyricsFromTitle(title: string): LyricsDraft {
	if (LYRICS_PATTERNS.some((p) => p.test(title))) {
		const cleanTitle = title
			.replace(/\(.*lyrics.*\)/gi, '')
			.replace(/\[.*lyrics.*\]/gi, '')
			.replace(/- lyrics/gi, '')
			.replace(/lyrics -/gi, '')
			.replace(/official lyric video/gi, '')
			.trim();
		return {
			lines: [
				'[Verse 1]',
				cleanTitle,
				'',
				'[Chorus]',
				cleanTitle,
				'',
				'[Verse 2]',
				'(Add lyrics here)',
				'',
				'[Chorus]',
				cleanTitle,
			],
			source: 'title',
			confidence: 0.7,
		};
	}

	if (MUSIC_VIDEO_PATTERNS.some((p) => p.test(title))) {
		const songTitle = title
			.replace(/official music video/gi, '')
			.replace(/official video/gi, '')
			.replace(/music video/gi, '')
			.trim();
		return {
			lines: [
				'[Verse 1]',
				songTitle,
				'',
				'[Chorus]',
				'(Add lyrics here)',
				'',
				'[Verse 2]',
				'(Add lyrics here)',
			],
			source: 'title',
			confidence: 0.5,
		};
	}

	return { lines: [], source: 'none', confidence: 0 };
}
