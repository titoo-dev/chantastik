import type {
	Audio,
	IsoTimestamp,
	Lyrics,
	Project,
	ProjectId,
} from '../../domain/index.js';

/**
 * PORTS OUTBOUND (driven) — interfaces que le domaine REQUIERT du monde
 * extérieur. Les `infra-*` les implémentent (KV, R2, YouTube, Remotion…).
 * Le domaine n'importe jamais ces implémentations : il reçoit un objet
 * conforme à ces interfaces par injection (composition root).
 */

export interface ProjectRepository {
	save(project: Project): Promise<void>;
	findById(id: ProjectId): Promise<Project | null>;
	findAll(): Promise<Project[]>;
	delete(id: ProjectId): Promise<void>;
}

export interface LyricsRepository {
	save(lyrics: Lyrics): Promise<void>;
	findById(id: string): Promise<Lyrics | null>;
	findByProject(projectId: ProjectId): Promise<Lyrics | null>;
}

export interface AudioRepository {
	save(audio: Audio): Promise<void>;
	findById(id: string): Promise<Audio | null>;
}

/** Stockage d'objets binaires (R2). Découplé du repository de métadonnées. */
export interface BlobStorage {
	put(key: string, data: ArrayBuffer | Uint8Array, contentType: string): Promise<void>;
	get(key: string): Promise<ArrayBuffer | null>;
	delete(key: string): Promise<void>;
}

/** Extraction de métadonnées audio (adapter `music-metadata`). */
export interface MetadataExtractor {
	extract(
		data: ArrayBuffer,
		filename: string
	): Promise<{
		title?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string[];
		duration?: number;
		cover?: { format: string; data: Uint8Array };
	}>;
}

/** Accès à l'API YouTube (adapter `infra-youtube`). */
export interface YoutubeGateway {
	searchLyrics(query: string): Promise<{ videoId: string; title: string }[]>;
}

/** Déclenchement d'un rendu vidéo — implémentation = decision gate Phase 6. */
export interface VideoRenderer {
	render(input: {
		projectId: ProjectId;
		theme: string;
		aspectRatio: 'horizontal' | 'vertical';
	}): Promise<{ renderId: string; outputUrl?: string }>;
}

/* --- Ports techniques : rendent le domaine déterministe & testable --- */

export interface Clock {
	now(): IsoTimestamp;
}

export interface IdGenerator {
	generate(): string;
}

export interface Hasher {
	hash(data: ArrayBuffer): Promise<string>;
}
