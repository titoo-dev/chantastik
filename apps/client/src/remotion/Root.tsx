import './index.css';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import { type Lyrics, LyricsPropsSchema } from './schema';
import type { LyricLine } from '@/components/lyric-studio/lyric-line-item';

export const RemotionRoot: React.FC = () => {
	// Process lyrics from the text file
	const lyricsData = parseLyrics();

	// Calculate total duration based on lyrics
	const totalFrames =
		lyricsData.length > 0
			? lyricsData[lyricsData.length - 1].endFrame + 30
			: 0; // Add a buffer of 1 second at the end
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComposition}
				schema={LyricsPropsSchema}
				defaultProps={{
					lyrics: lyricsData,
					fontFamily: 'Inter, system-ui, sans-serif',
					backgroundColor: 'hsl(0 0% 20%)',
					textColor: 'hsl(0 0% 98%)',
					highlightColor: 'hsl(142.1 76.2% 36.3%)',
				}}
				durationInFrames={totalFrames}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};

// Function to parse the lyrics file into the required format
export function parseLyrics(lyricLines?: LyricLine[]): Lyrics {
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
