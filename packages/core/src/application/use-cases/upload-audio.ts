import {
	AudioId,
	CoverId,
	ProjectId,
	err,
	ok,
	ValidationError,
	isSupportedAudioType,
	type Audio,
	type Project,
	type Result,
} from '../../domain/index.js';
import type {
	AudioRepository,
	BlobStorage,
	Clock,
	Hasher,
	IdGenerator,
	MetadataExtractor,
	ProjectRepository,
} from '../ports/index.js';

export type UploadAudioDeps = {
	readonly audio: AudioRepository;
	readonly projects: ProjectRepository;
	readonly audioFiles: BlobStorage;
	readonly coverFiles: BlobStorage;
	readonly metadata: MetadataExtractor;
	readonly hasher: Hasher;
	readonly clock: Clock;
	readonly ids: IdGenerator;
};

export type UploadAudioInput = {
	readonly filename: string;
	readonly contentType: string;
	readonly size: number;
	readonly data: ArrayBuffer;
};

export type UploadAudioResult =
	| { readonly kind: 'created'; readonly audio: Audio; readonly project: Project }
	| { readonly kind: 'duplicate'; readonly existing: Audio };

const coverExtension = (format: string): string =>
	format.split('/')[1] ?? 'jpg';

/**
 * Use case `uploadAudio` — porte la logique de `POST /audio` :
 * dédup par hash → extraction métadonnées + cover → stockage R2 → création
 * automatique d'un projet. Tout l'I/O passe par des ports : aucune référence
 * à R2/KV/music-metadata ici.
 */
export async function uploadAudio(
	deps: UploadAudioDeps,
	input: UploadAudioInput
): Promise<Result<UploadAudioResult, ValidationError>> {
	if (!isSupportedAudioType(input.contentType)) {
		return err(new ValidationError('Type de fichier audio invalide.'));
	}

	const fileHash = await deps.hasher.hash(input.data);

	const existing = await deps.audio.findByHash(fileHash);
	if (existing) {
		return ok({ kind: 'duplicate', existing });
	}

	const audioId = AudioId(deps.ids.generate());
	const extracted = await deps.metadata.extract(input.data, input.filename);

	let coverArt: Audio['coverArt'];
	if (extracted.cover) {
		const coverId = CoverId(`${audioId}-cover`);
		const coverKey = `${coverId}.${coverExtension(extracted.cover.format)}`;
		await deps.coverFiles.put(
			coverKey,
			extracted.cover.data,
			extracted.cover.format
		);
		coverArt = {
			id: coverId,
			format: extracted.cover.format,
			size: extracted.cover.data.length,
		};
	}

	await deps.audioFiles.put(`${audioId}.mp3`, input.data, input.contentType);

	const now = deps.clock.now();
	const audio: Audio = {
		id: audioId,
		filename: input.filename,
		contentType: input.contentType,
		size: input.size,
		fileHash,
		createdAt: now,
		metadata: {
			title: extracted.title,
			artist: extracted.artist,
			album: extracted.album,
			year: extracted.year,
			genre: extracted.genre,
			duration: extracted.duration,
		},
		...(coverArt ? { coverArt } : {}),
	};
	await deps.audio.save(audio);

	const project: Project = {
		id: ProjectId(deps.ids.generate()),
		name: `${extracted.title ?? 'New Project'} - ${extracted.artist ?? 'Unknown Artist'}`,
		audioId,
		createdAt: now,
		updatedAt: now,
	};
	await deps.projects.save(project);

	return ok({ kind: 'created', audio, project });
}
