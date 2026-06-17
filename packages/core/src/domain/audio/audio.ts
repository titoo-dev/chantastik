import type {
	AudioId,
	CoverId,
	IsoTimestamp,
	ProjectId,
} from '../shared/identifiers.js';

export type AudioMetadata = {
	readonly title?: string;
	readonly artist?: string;
	readonly album?: string;
	readonly year?: string;
	readonly genre?: readonly string[];
	/** Durée en secondes. */
	readonly duration?: number;
};

export type CoverArt = {
	readonly id: CoverId;
	readonly format: string;
	readonly size: number;
};

/**
 * Un fichier audio importé (entité). Type UNIFIÉ remplaçant `Audio`
 * (serveur) et `AudioMeta` (client).
 */
export type Audio = {
	readonly id: AudioId;
	readonly filename: string;
	readonly contentType: string;
	readonly size: number;
	/** Hash de contenu — sert à la déduplication des uploads. */
	readonly fileHash: string;
	readonly createdAt: IsoTimestamp;
	readonly projectId?: ProjectId;
	readonly metadata?: AudioMetadata;
	readonly coverArt?: CoverArt;
};

/** Type MIME audio accepté. */
export const isSupportedAudioType = (contentType: string): boolean =>
	contentType.startsWith('audio/');
