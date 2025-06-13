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
[ti:Stand]
[ar:Donnie McClurkin]
[al:Donnie McClurkin]

[00:13.82]What do you do when you've done all you can
[00:19.66]And it seems like it's never enough?
[00:26.06]And what do you say when your friends turn away
[00:34.48]And you're all alone?
[00:40.55]Tell me, what do you give when you've given your all
[00:47.56]And it seems like you can't make it through?
[00:53.66]Well, you just stand when there's nothing left to do
[01:01.18]You just stand, watch the Lord see you through
[01:09.25]Yes, after you've done all you can
[01:15.26]You just stand
[01:22.21]Tell me, how do you handle the guilt of your past?
[01:30.25]Tell me, how do you deal with the shame?
[01:35.33]And how can you smile while your heart has been broken
[01:43.44]And filled with pain?
[01:49.52]Tell me, what do you give when you've given your all? Yeah
[01:57.87]Seems like you can't make it through
[02:02.47]Child, you just stand when there's nothing left to do
[02:09.91]You just stand, watch the Lord see you through
[02:17.47]Yes, after you've done all you can
[02:23.15]You just stand
[02:27.39]Stand and be sure
[02:30.56]Be not entangled in that bondage again
[02:36.21]You just stand (Stand) and endure (And endure)
[02:43.58]God has a purpose, hey
[02:46.16]Yes, God has a plan
[02:48.75]Tell me, what do you do when you've done all you can
[02:56.55]And it seems like you can't make it through?
[03:00.94]Child, you just stand (Stand)
[03:05.07]You just stand (Stand)
[03:08.48]Stand (Stand)
[03:11.64]Don't you dare give up (Ooh, you just)
[03:15.22]Through the storm (Stand), stand through the rain (Stand)
[03:21.41]Through the hurt (Stand), jet through the pain (You just)
[03:27.56]Don't you bow (Stand), and don't you bend (Stand)
[03:34.02]Don't give up (Stand), no, don't give in (You just)
[03:40.64]Hold on (Stand), just be strong (Stand)
[03:46.74]God will step in (Stand), and it won't be long, no (You just)
[03:54.58]After you've done all you can (After you've done all you can)
[04:01.18]After you've done all you can (After you've done all you can)
[04:08.26]After you've gone through the hurt (After you've done all you can)
[04:15.44]After you've gone through the pain (After you've done all you can)
[04:22.28]After you've gone through the storm (After you've done all you can), hallelujah
[04:27.59]After you've gone through the rain (After you've done all you can)
[04:35.30]Prayed and cried
[04:38.72]Prayed and cried (After you done all you can)
[04:41.92]Prayed and you've cried (After you've done all you can)
[04:45.58]Prayed and cry, oh
[04:48.88]After you've done all you can
[04:54.33]You just stand, oh, whoa, oh, oh, mm
`;

export const RemotionRoot: React.FC = () => {
	const COVER_URL =
		'https://mp3-uploader.dev-titosy.workers.dev/audio/959bfcb9-8ef1-46f4-b174-516c24dfc015/cover';

	const MP3_URL =
		'https://mp3-uploader.dev-titosy.workers.dev/audio/959bfcb9-8ef1-46f4-b174-516c24dfc015';

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
