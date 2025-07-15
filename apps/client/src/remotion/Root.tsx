import './index.css';
import { Composition } from 'remotion';
import { type Lyrics, type LyricsProps, LyricsPropsSchema } from './schema';
import type { LyricLine } from '@/data/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

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


export const API_BASE_URL = import.meta.env.VITE_DEV_SERVER_URL || 'http://localhost:8000/api';

const lrc = `
[ti:Love]
[ar:Keyshia Cole]
[al:The Way It Is]

[00:24.58]I used to think that I wasn't fine enough
[00:28.66]And I used to think that I wasn't wild enough
[00:32.73]But I won't waste my time tryna figure out why you playin' games
[00:38.82]What's this all about?
[00:40.80]And I can't believe
[00:42.74]You're hurting me
[00:44.68]I met your girl, what a difference
[00:49.02]What you see in her
[00:51.03]You ain't seen in me
[00:53.18]But I guess it was all just make-believe
[00:56.98]Oh, love
[01:01.26]Never knew what I was missin'
[01:05.47]But I knew once we start kissin'
[01:09.10]I found
[01:14.22]Love
[01:17.78]Never knew what I was missin'
[01:21.98]But I knew once we start kissin'
[01:25.49]I found, found you
[01:33.59]Now you're gone, what am I gonna do?
[01:37.84]So empty
[01:39.94]My heart, my soul, can't go on
[01:45.16]Go on, without you
[01:48.92]My rainy days fade away when you
[01:52.87]Come around, please tell me, baby
[01:57.72]Why you go so far away?
[02:02.70]Why you go?
[02:03.61]Love
[02:07.20]Never knew what I was missin'
[02:11.32]But I knew once we start kissin'
[02:14.85]I found
[02:20.01]Love
[02:23.62]Never knew what I was missin'
[02:27.75]But I knew once we start kissin'
[02:31.37]I found, I found you
[02:38.43]Who would have known I'd find you?
[02:46.59]Ooh
[02:53.76]Now you're gone, what am I gonna do?
[02:58.00]So empty
[03:00.16]My heart, my soul, can't go on
[03:06.50]Go on, baby, without you
[03:11.29]Rainy days fade away
[03:15.09]When you come around
[03:16.65]Say you're here to stay
[03:19.07]With me, boy
[03:20.74]I don't want you to leave me
[03:23.40]I, I need you
[03:25.90]Love
[03:29.53]Never knew what I was missin' (I never knew)
[03:33.65]But I knew once we start kissin'
[03:37.14]I found (found love)
[03:42.30]Love
[03:45.99]Never knew what (I never) I was missin' (never, never)
[03:50.19]But I knew once we start kissin'
[03:53.70]I found (I found, I found)
[03:58.84]Love
[04:02.37]Never knew what I was missin'
[04:06.48]But I knew once we start kissin'
[04:10.10]I found
`;

export const RemotionRoot: React.FC = () => {
	const COVER_URL = `${API_BASE_URL}/audio/a5a73b28-5d46-49fa-b387-30cac07ea9cb/cover`;

	const MP3_URL = `${API_BASE_URL}/audio/a5a73b28-5d46-49fa-b387-30cac07ea9cb`;

	const [audioMeta, setAudioMeta] = useState<AudioMeta | null>(null);

	useEffect(() => {
		const fetchAudioMeta = async () => {
			// Extract audio ID from the COVER_URL or use a default ID
			const audioId = 'a5a73b28-5d46-49fa-b387-30cac07ea9cb';

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
		return import('./renderers/retro-reel-renderer');
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
