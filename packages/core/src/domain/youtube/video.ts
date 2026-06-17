/**
 * Logique PURE autour des vidéos YouTube — rapatriée de
 * `apps/server/src/utils.ts` (`extractVideoId`, `parseDurationToSeconds`,
 * `calculateTitleMatchScore`). Aucune I/O.
 */

/** Extrait l'identifiant vidéo d'une URL YouTube (watch ou youtu.be). */
export function extractVideoId(url: string): string | null {
	try {
		const u = new URL(url);
		if (u.hostname.includes('youtube.com')) {
			return u.searchParams.get('v');
		}
		if (u.hostname === 'youtu.be') {
			return u.pathname.slice(1) || null;
		}
		return null;
	} catch {
		return null;
	}
}

/** Convertit une durée ISO-8601 (`PT4M13S`) en secondes. */
export function parseIso8601Duration(duration: string): number {
	if (!duration) return 0;
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;
	const hours = Number.parseInt(match[1] ?? '0', 10);
	const minutes = Number.parseInt(match[2] ?? '0', 10);
	const seconds = Number.parseInt(match[3] ?? '0', 10);
	return hours * 3600 + minutes * 60 + seconds;
}

/** Score de pertinence d'un titre vis-à-vis de termes de recherche. */
export function calculateTitleMatchScore(
	title: string,
	searchTerms: readonly string[]
): number {
	if (!title || searchTerms.length === 0) return 0;
	const titleLower = title.toLowerCase();
	let score = 0;

	for (const term of searchTerms) {
		const termLower = term.toLowerCase();
		const wordBoundary = new RegExp(`\\b${termLower}\\b`, 'i');
		if (wordBoundary.test(titleLower)) {
			score += 10;
		} else if (titleLower.includes(termLower)) {
			score += 5;
		}
		const position = titleLower.indexOf(termLower);
		if (position !== -1) {
			score += Math.max(0, 5 - Math.floor(position / 10));
		}
	}

	const uniqueMatches = searchTerms.filter((term) =>
		titleLower.includes(term.toLowerCase())
	).length;
	if (uniqueMatches > 1) {
		score += uniqueMatches * 2;
	}
	return score;
}
