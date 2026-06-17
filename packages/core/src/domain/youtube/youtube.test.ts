import { describe, it, expect } from 'vitest';
import { validateSearchQuery } from './search-query.js';
import {
	calculateTitleMatchScore,
	extractVideoId,
	parseIso8601Duration,
} from './video.js';
import { draftLyricsFromTitle } from '../lyrics/lyrics-from-title.js';

describe('validateSearchQuery', () => {
	it('accepte une requête valide et la normalise', () => {
		const r = validateSearchQuery('  daft punk  ');
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toBe('daft punk');
	});

	it('rejette trop court, trop long et motifs interdits', () => {
		expect(validateSearchQuery('a').ok).toBe(false);
		expect(validateSearchQuery('x'.repeat(101)).ok).toBe(false);
		expect(validateSearchQuery('drop table users').ok).toBe(false);
		expect(validateSearchQuery(42).ok).toBe(false);
	});
});

describe('extractVideoId', () => {
	it('extrait depuis watch et youtu.be', () => {
		expect(
			extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
		).toBe('dQw4w9WgXcQ');
		expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
			'dQw4w9WgXcQ'
		);
		expect(extractVideoId('not a url')).toBeNull();
	});
});

describe('parseIso8601Duration', () => {
	it('convertit PT4M13S en secondes', () => {
		expect(parseIso8601Duration('PT4M13S')).toBe(253);
		expect(parseIso8601Duration('PT1H2M3S')).toBe(3723);
		expect(parseIso8601Duration('')).toBe(0);
	});
});

describe('calculateTitleMatchScore', () => {
	it('score plus élevé pour correspondance exacte de mot', () => {
		const exact = calculateTitleMatchScore('Daft Punk - One More Time', [
			'daft',
			'punk',
		]);
		const none = calculateTitleMatchScore('Random Song', ['daft', 'punk']);
		expect(exact).toBeGreaterThan(none);
		expect(none).toBe(0);
	});
});

describe('draftLyricsFromTitle', () => {
	it('génère une trame confiante pour une vidéo "lyrics"', () => {
		const d = draftLyricsFromTitle('Artist - Song (Lyrics)');
		expect(d.source).toBe('title');
		expect(d.confidence).toBeCloseTo(0.7);
		expect(d.lines.length).toBeGreaterThan(0);
	});

	it('renvoie none pour un titre quelconque', () => {
		const d = draftLyricsFromTitle('vacation vlog day 3');
		expect(d.source).toBe('none');
		expect(d.lines).toHaveLength(0);
	});
});
