import './index.css';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import { type Lyrics, LyricsPropsSchema } from './schema';

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
function parseLyrics(): Lyrics {
	// FPS for conversion from time to frames
	const fps = 30;

	// Read the LRC file content
	// In a real application, you would use fs.readFileSync or fetch
	// Here we're using the content from friends.lrc that was provided
	const lrcContent = `[ti:Untitled Song]
[ar:Unknown Artist]
[al:Unknown Album]

[00:15.59]And I never thought I'd feel this way
[00:21.12]And as far as I'm concerned
[00:24.37]I'm glad I got the chance to say
[00:29.35]That I do believe I love you
[00:33.60]And if I should ever go away
[00:39.39]Well, then close your eyes
[00:43.12]And try to feel the way we do today
[00:47.57]And then if you can remember
[00:53.80]Keep smiling, keep shining
[00:57.84]Knowing you can always count on me, for sure
[01:05.57]That's what friends are for
[01:10.14]For good times and bad times
[01:13.86]I'll be on your side forever more
[01:21.62]That's what friends are for
[01:33.11]Well, you came and opened me
[01:36.48]And now there's so much more I see
[01:41.13]And so by the way I thank you
[01:45.43]Whoa and then for the times when we're apart
[01:51.24]Well then close your eyes
[01:53.38]And know these words are comin' from my heart
[01:59.29]And then if you can remember, oh
[02:06.14]Keep smiling, keep shining
[02:09.79]Knowing you can always count on me, for sure
[02:17.47]That's what friends are for
[02:21.72]In good times, in bad times
[02:25.85]I'll be on your side forever more
[02:33.25]Oh, that's what friends are for
[02:37.71]Whoa oh-oh
[02:40.19]Keep smiling, keep shining
[02:43.71]Knowing you can always count on me, for sure
[02:51.64]That's what friends are for
[02:55.92]For good times and bad times
[02:59.83]I'll be on your side forever more
[03:07.89]That's what friends are for
[03:12.68]Oh-oh
[03:14.38]Keep smiling, keep shining
[03:17.90]Knowing you can always count on me, that's for sure
[03:24.72]'Cause I tell you that's what friends are for
[03:29.99]For good times and for bad times
[03:33.66]I'll be on your side forever more
[03:41.72]That's what friends are for
[03:44.43](That's what friends are for)
[03:46.32](Ha-ha, yeah)
[03:56.11]On me for sure
[03:58.22]I don't need for sure
[04:00.12]I don't need for sure
[04:01.98]That's what friends are for
[04:04.60]Keep smiling, keep shining`;

	// Parse LRC format
	const lines = lrcContent.split('\n');
	const lyrics: {
		text: string;
		time: string;
		startFrame: number;
		endFrame: number;
	}[] = [];

	// Regular expression to match timestamp and lyric text
	const lrcLineRegex = /^\[(\d{2}:\d{2}\.\d{2})\](.*)$/;

	// Function to convert LRC time format to frames
	const timeToFrames = (timeStr: string): number => {
		const [minutes, secondsMs] = timeStr.split(':');
		const seconds = secondsMs.split('.')[0];
		const milliseconds = secondsMs.split('.')[1];

		const totalSeconds =
			parseInt(minutes) * 60 +
			parseInt(seconds) +
			parseInt(milliseconds) / 100; // LRC format uses hundredths of seconds

		return Math.floor(totalSeconds * fps);
	};

	// Extract all valid lyrics lines
	lines.forEach((line) => {
		const match = line.match(lrcLineRegex);
		if (match) {
			const time = match[1];
			const text = match[2];

			lyrics.push({
				text,
				time,
				startFrame: timeToFrames(time),
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
