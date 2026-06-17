import type { LyricLine } from './lyrics.js';

/**
 * Parsing/sérialisation LRC — logique métier PURE (aucune I/O).
 * Remplace l'usage épars de `lrc-kit` côté client par une fonction testable
 * et possédée par le domaine.
 *
 * Format supporté : `[mm:ss.xx] texte` (timestamps optionnels par ligne).
 */
const LRC_LINE = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s?(.*)$/;

export function parseLrc(raw: string): LyricLine[] {
	const lines: LyricLine[] = [];
	let id = 0;
	for (const rawLine of raw.split(/\r?\n/)) {
		const trimmed = rawLine.trim();
		if (trimmed.length === 0) continue;
		const match = LRC_LINE.exec(trimmed);
		if (!match) {
			lines.push({ id: id++, text: trimmed });
			continue;
		}
		const [, mm, ss, frac, text] = match;
		const minutes = Number(mm);
		const seconds = Number(ss);
		const fraction = frac ? Number(`0.${frac}`) : 0;
		lines.push({
			id: id++,
			text: (text ?? '').trim(),
			timestamp: minutes * 60 + seconds + fraction,
		});
	}
	return lines;
}

function formatTimestamp(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const hundredths = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);
	const pad = (n: number, len = 2) => String(n).padStart(len, '0');
	return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

export function serializeLrc(lines: readonly LyricLine[]): string {
	return lines
		.map((line) =>
			typeof line.timestamp === 'number'
				? `[${formatTimestamp(line.timestamp)}] ${line.text}`
				: line.text
		)
		.join('\n');
}
