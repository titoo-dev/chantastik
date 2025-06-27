export type AudioMeta = {
	id?: string;
	filename?: string;
	contentType?: string;
	size?: number;
	fileHash?: string;
	createdAt?: Date;
	metadata?: Metadata;
	coverArt?: CoverArt; // Cover art might not always be available
}

export type CoverArt = {
	id: string;
	format: string;
	size: number;
}

export type Metadata = {
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

export type ServerLyrics = {
	id: string;
	lines: LyricLine[];
};

export type AspectRatioType = 'horizontal' | 'vertical';
