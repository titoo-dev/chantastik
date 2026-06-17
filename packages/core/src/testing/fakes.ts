import {
	IsoTimestamp,
	type Audio,
	type Lyrics,
	type Project,
	type ProjectId,
} from '../domain/index.js';
import type {
	AudioRepository,
	BlobStorage,
	Clock,
	Hasher,
	IdGenerator,
	LyricsRepository,
	MetadataExtractor,
	ProjectRepository,
} from '../application/index.js';

/**
 * Fakes in-memory — adapters de TEST des ports outbound.
 * Permettent d'exercer les use cases sans Cloudflare. Les vrais adapters
 * (`@repo/infra-cloudflare`) devront passer la même suite de tests de contrat.
 */

export class InMemoryProjectRepository implements ProjectRepository {
	private readonly store = new Map<string, Project>();

	async save(project: Project): Promise<void> {
		this.store.set(project.id, project);
	}
	async findById(id: ProjectId): Promise<Project | null> {
		return this.store.get(id) ?? null;
	}
	async findAll(): Promise<Project[]> {
		return [...this.store.values()];
	}
	async delete(id: ProjectId): Promise<void> {
		this.store.delete(id);
	}
}

export class InMemoryLyricsRepository implements LyricsRepository {
	private readonly store = new Map<string, Lyrics>();

	async save(lyrics: Lyrics): Promise<void> {
		this.store.set(lyrics.id, lyrics);
	}
	async findById(id: string): Promise<Lyrics | null> {
		return this.store.get(id) ?? null;
	}
	async findByProject(projectId: ProjectId): Promise<Lyrics | null> {
		for (const l of this.store.values()) {
			if (l.projectId === projectId) return l;
		}
		return null;
	}
}

export class InMemoryAudioRepository implements AudioRepository {
	private readonly store = new Map<string, Audio>();

	async save(audio: Audio): Promise<void> {
		this.store.set(audio.id, audio);
	}
	async findById(id: string): Promise<Audio | null> {
		return this.store.get(id) ?? null;
	}
	async findByHash(hash: string): Promise<Audio | null> {
		for (const a of this.store.values()) {
			if (a.fileHash === hash) return a;
		}
		return null;
	}
	async delete(id: string): Promise<void> {
		this.store.delete(id);
	}
}

/** Stockage binaire en mémoire (remplace R2 en test). */
export class InMemoryBlobStorage implements BlobStorage {
	readonly store = new Map<string, ArrayBuffer>();

	async put(key: string, data: ArrayBuffer | Uint8Array): Promise<void> {
		const buf =
			data instanceof Uint8Array
				? data.buffer.slice(
						data.byteOffset,
						data.byteOffset + data.byteLength
					)
				: data;
		this.store.set(key, buf as ArrayBuffer);
	}
	async get(key: string): Promise<ArrayBuffer | null> {
		return this.store.get(key) ?? null;
	}
	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

/** Extracteur de métadonnées configurable (remplace music-metadata). */
export class StubMetadataExtractor implements MetadataExtractor {
	constructor(
		private readonly value: Awaited<
			ReturnType<MetadataExtractor['extract']>
		> = {}
	) {}
	async extract(): ReturnType<MetadataExtractor['extract']> {
		return this.value;
	}
}

/** Hash déterministe basé sur la taille — suffisant pour tester la dédup. */
export class FakeHasher implements Hasher {
	async hash(data: ArrayBuffer): Promise<string> {
		return `hash-${data.byteLength}`;
	}
}

/** Horloge fixe — rend les tests déterministes. */
export class FixedClock implements Clock {
	constructor(private readonly value = '2026-01-01T00:00:00.000Z') {}
	now(): IsoTimestamp {
		return IsoTimestamp(this.value);
	}
}

/** Générateur d'ids séquentiel — prévisible en test. */
export class SequentialIdGenerator implements IdGenerator {
	private counter = 0;
	constructor(private readonly prefix = 'id') {}
	generate(): string {
		this.counter += 1;
		return `${this.prefix}-${this.counter}`;
	}
}
