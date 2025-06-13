import './index.css';
import { Composition } from 'remotion';
import { type Lyrics, type LyricsProps, LyricsPropsSchema } from './schema';
import type { LyricLine } from '@/data/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

export const API_BASE_URL = 'https://mp3-uploader.dev-titosy.workers.dev';

const lrc = `
[ti:ALL MY LOVE]
[ar:Coldplay]
[al:Moon Music (Full Moon Edition)]

[00:07.81]We've been through low
[00:10.02]Been through sunshine, been through snow
[00:14.89]All the colors of the weather
[00:21.84]We've been through high
[00:24.20]Every corner of the sky
[00:28.87]And still we're holding on together
[00:35.95]You got all my love
[00:41.13]Whether it rains or pours, I'm all yours
[00:49.88]You've got all my love
[00:55.13]Whether it rains, it remains
[01:03.87]You've got all my love
[01:24.50]Until I die
[01:26.83]Let me hold you if you cry
[01:31.66]Be my one, two, three, forever
[01:38.59]'Cause you got all my love
[01:43.88]Whether it rains or pours, I'm all yours
[01:52.56]You've got all my love
[01:57.63]Whether it rains, it remains
[02:06.54]You've got all my love
[02:28.15]La-la, la-la, la, lay
[02:33.47]Whether it rains or pours, I'm all yours
[02:42.12]La-la, la-la, la, lay
[02:47.78]That's all, all I can say
[03:07.42]Ooh, you got all my love
[03:15.08]Oh, for now and always, 'til the end of my days
[03:23.76]You got all my love
[03:30.84]You've got all my love
`;

export const RemotionRoot: React.FC = () => {
	const COVER_URL =
		'https://mp3-uploader.dev-titosy.workers.dev/audio/08a193d7-0f8a-4990-b4f8-d7c6c5939830/cover';

	const MP3_URL =
		'https://mp3-uploader.dev-titosy.workers.dev/audio/08a193d7-0f8a-4990-b4f8-d7c6c5939830';

	const [audioMeta, setAudioMeta] = useState<AudioMeta | null>(null);

	useEffect(() => {
		const fetchAudioMeta = async () => {
			// Extract audio ID from the COVER_URL or use a default ID
			const audioId = '08a193d7-0f8a-4990-b4f8-d7c6c5939830';

			try {
				const metadata = await getAudioMetadata(audioId);
				setAudioMeta(metadata);
			} catch (error) {
				console.error('Error fetching audio metadata:', error);
			}
		};
		fetchAudioMeta();
	}, []);

	const lazyComponent = useCallback(() => {
		return import('./themes/retro-reel');
	}, []);

	const lyricLines = parseLrcToLines(lrc);

	const lyricsData = useCallback(() => {
		return parseLines(lyricLines);
	}, [lyricLines])();

	const inputProps = useMemo(() => {
		return {
			lyrics: lyricsData,
			backgroundImage: COVER_URL,
			audioSrc: MP3_URL,
		} as LyricsProps;
	}, [lyricsData]);

	const totalFrames = useMemo(() => {
		if (lyricsData.length === 0) return 0;

		// Get audio duration in seconds
		const audioDuration = audioMeta?.metadata?.duration || 0;

		// Calculate frames based on audio duration (assuming 30 FPS)
		const audioFrames = Math.ceil(audioDuration * 30);

		// Get last lyric end frame
		const lastLyricFrame = lyricsData[lyricsData.length - 1].endFrame;

		// Use the maximum between audio duration and last lyric frame, plus buffer
		return Math.max(audioFrames, lastLyricFrame) + 30;
	}, [audioMeta?.id]);

	return (
		<>
			<Composition
				id="LyricsPlayer"
				lazyComponent={lazyComponent}
				schema={LyricsPropsSchema}
				defaultProps={{
					...inputProps,
				}}
				durationInFrames={totalFrames}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};

export async function getAudioMetadata(id: string): Promise<AudioMeta> {
	try {
		const response = await fetch(`${API_BASE_URL}/audio/${id}/meta`);

		if (!response.ok) {
			throw new Error('Failed to fetch audio metadata');
		}

		const data: AudioMeta = await response.json();
		return data;
	} catch (error) {
		console.error('Metadata fetch failed:', error);
		throw error;
	}
}

function parseLrcToLines(lrc: string): LyricLine[] {
	try {
		const lines = lrc.split('\n');

		// Extract lyric lines with timestamps
		const parsedLyricEntries = lines
			.filter(
				(line) => line.trim() && line.match(/^\[\d{2}:\d{2}(\.\d+)?\]/)
			)
			.map((line, index) => {
				const match = line.match(/^\[(\d{2}):(\d{2})(\.\d+)?\](.*)/);
				if (match) {
					const minutes = parseInt(match[1], 10);
					const seconds = parseInt(match[2], 10);
					const milliseconds = match[3] ? parseFloat(match[3]) : 0;
					const text = match[4].trim();

					// Convert to seconds
					const timestamp = minutes * 60 + seconds + milliseconds;

					return {
						id: index + 1,
						text,
						timestamp,
					};
				}
				return null;
			})
			.filter(Boolean) as LyricLine[];

		if (parsedLyricEntries.length > 0) {
			return parsedLyricEntries;
		} else {
			throw new Error('No valid lyric lines found in the LRC file.');
		}
	} catch (error) {
		console.error('Error parsing LRC:', error);
		return [];
	}
}

// Function to parse the lyrics file into the required format
export function parseLines(lyricLines?: LyricLine[]): Lyrics {
	// FPS for conversion from time to frames
	const fps = 30;
	const lyrics: {
		text: string;
		time: string;
		startFrame: number;
		endFrame: number;
	}[] = [];

	// If no lyrics provided or empty array, return empty lyrics
	if (!lyricLines || lyricLines.length === 0) {
		return [];
	}

	// Sort lyrics by timestamp to ensure proper order
	const sortedLyrics = [...lyricLines].sort(
		(a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
	);

	// Function to convert seconds to LRC time format (MM:SS.XX)
	const secondsToTimeStr = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		const centisecs = Math.floor((seconds % 1) * 100);

		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
	};

	// Convert LyricLine objects to required format
	sortedLyrics.forEach((line) => {
		if (line.text && line.timestamp !== undefined) {
			const timeStr = secondsToTimeStr(line.timestamp);

			lyrics.push({
				text: line.text,
				time: timeStr,
				startFrame: Math.floor(line.timestamp * fps),
				endFrame: 0, // Will be calculated in the next step
			});
		}
	});

	// Calculate end frames
	for (let i = 0; i < lyrics.length; i++) {
		if (i < lyrics.length - 1) {
			lyrics[i].endFrame = lyrics[i + 1].startFrame - 1;
		} else {
			// For the last lyric, add 5 seconds
			lyrics[i].endFrame = lyrics[i].startFrame + 5 * fps;
		}
	}

	return lyrics;
}
