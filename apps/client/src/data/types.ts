export interface AudioMeta {
	id?: string;
	filename?: string;
	contentType?: string;
	size?: number;
	fileHash?: string;
	createdAt?: Date;
	metadata?: Metadata;
	coverArt?: CoverArt; // Cover art might not always be available
}

export interface CoverArt {
	id: string;
	format: string;
	size: number;
}

export interface Metadata {
	title: string;
	artist?: string; // Artist might be unknown
	album?: string; // Album might be unknown
	year?: string; // Year might be unknown
	genre?: string[]; // Genre might be unknown
	duration: number; // Duration should typically be available
}

export type LyricLine = {
	id: number;
	text: string;
	timestamp?: number;
};
