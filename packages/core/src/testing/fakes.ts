import { IsoTimestamp, type Lyrics, type Project, type ProjectId } from '../domain/index.js';
import type {
	Clock,
	IdGenerator,
	LyricsRepository,
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
