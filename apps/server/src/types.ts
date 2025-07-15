import { KVNamespace, R2Bucket } from '@cloudflare/workers-types';

export type Bindings = {
	YOUTUBE_API_KEY: string;
	AUDIO_FILES: R2Bucket;
	AUDIO_KV: KVNamespace;
	COVER_FILES: R2Bucket;
	PROJECT_KV: KVNamespace;
	LYRICS_KV: KVNamespace;
};

export type Project = {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	audioId: string;
	assetIds?: string[];
	metadata?: {
		tags?: string[];
		category?: string;
		public?: boolean;
	};
};

export type Audio = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	createdAt: string;
	fileHash: string;
	projectId?: string;
	metadata?: {
		title?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string[];
		duration?: number;
	};
	coverArt?: {
		id: string;
		format: string;
		size: number;
	};
};

export type Lyrics = {
	id: string;
	createdAt: string;
	updatedAt: string;
	text: string;
	projectId: string;
	lines: LyricsLine[];
	metadata?: {
		language?: string;
		source?: 'manual' | 'imported' | 'generated';
		confidence?: number;
		version?: number;
	};
};

export type LyricsLine = {
	id: number;
	text: string;
	timestamp?: number;
	style?: {
		emphasis?: boolean;
		volume?: 'soft' | 'normal' | 'loud';
		duration?: number; // how long to display this line
	};
};
