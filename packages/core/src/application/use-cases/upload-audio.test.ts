import { describe, it, expect } from 'vitest';
import {
	FakeHasher,
	FixedClock,
	InMemoryAudioRepository,
	InMemoryBlobStorage,
	InMemoryProjectRepository,
	SequentialIdGenerator,
	StubMetadataExtractor,
} from '../../testing/index.js';
import { uploadAudio } from './upload-audio.js';

const buildDeps = (
	metadata = new StubMetadataExtractor({
		title: 'Song',
		artist: 'Artist',
		duration: 200,
	})
) => ({
	audio: new InMemoryAudioRepository(),
	projects: new InMemoryProjectRepository(),
	audioFiles: new InMemoryBlobStorage(),
	coverFiles: new InMemoryBlobStorage(),
	metadata,
	hasher: new FakeHasher(),
	clock: new FixedClock(),
	ids: new SequentialIdGenerator(),
});

const input = (bytes = 1024) => ({
	filename: 'song.mp3',
	contentType: 'audio/mpeg',
	size: bytes,
	data: new ArrayBuffer(bytes),
});

describe('uploadAudio', () => {
	it('crée audio + projet et stocke le blob', async () => {
		const deps = buildDeps();
		const r = await uploadAudio(deps, input());
		expect(r.ok).toBe(true);
		if (!r.ok || r.value.kind !== 'created') throw new Error('attendu created');
		expect(r.value.project.name).toBe('Song - Artist');
		expect(r.value.project.audioId).toBe(r.value.audio.id);
		expect(deps.audioFiles.store.has(`${r.value.audio.id}.mp3`)).toBe(true);
	});

	it('stocke la cover quand présente', async () => {
		const deps = buildDeps(
			new StubMetadataExtractor({
				title: 'X',
				cover: { format: 'image/jpeg', data: new Uint8Array([1, 2, 3]) },
			})
		);
		const r = await uploadAudio(deps, input());
		if (!r.ok || r.value.kind !== 'created') throw new Error('attendu created');
		expect(r.value.audio.coverArt?.format).toBe('image/jpeg');
		expect(deps.coverFiles.store.size).toBe(1);
	});

	it('détecte un doublon par hash de contenu', async () => {
		const deps = buildDeps();
		await uploadAudio(deps, input(2048));
		const again = await uploadAudio(deps, input(2048)); // même taille → même hash fake
		expect(again.ok).toBe(true);
		if (!again.ok) return;
		expect(again.value.kind).toBe('duplicate');
	});

	it('rejette un type non audio', async () => {
		const deps = buildDeps();
		const r = await uploadAudio(deps, {
			...input(),
			contentType: 'application/pdf',
		});
		expect(r.ok).toBe(false);
	});
});
