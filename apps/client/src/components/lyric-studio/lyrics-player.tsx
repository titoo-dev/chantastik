import { PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { parseLyrics } from '@/remotion/Root';
import { Player } from '@remotion/player';
import { MyComposition } from '@/remotion/Composition';
import { LyricsPreviewCard } from '../lyrics-preview-card';

export const LyricsPlayer = () => {
	const lyricsData = parseLyrics();

	// Calculate total duration based on lyrics
	const { showVideoPreview } = useAppContext();

	const totalFrames =
		lyricsData.length > 0
			? lyricsData[lyricsData.length - 1].endFrame + 30
			: 0; // Add a buffer of 1 second at the end

	if (!showVideoPreview) {
		return null; // Don't render if video preview is not shown
	}

	return (
		<Card className="pt-0 shadow-none col-span-1">
			<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
				<CardTitle className="flex items-center gap-2 py-2">
					<PlayCircle className="h-5 w-5 text-primary" />
					Lyric Player
				</CardTitle>
			</CardHeader>

			<CardContent className="p-6">
				<Player
					component={MyComposition}
					inputProps={{
						lyrics: lyricsData,
						fontFamily: 'Inter, system-ui, sans-serif',
						backgroundColor: 'hsl(0 0% 20%)',
						textColor: 'hsl(0 0% 98%)',
						highlightColor: 'hsl(142.1 76.2% 36.3%)',
					}}
					durationInFrames={totalFrames}
					fps={30}
					compositionWidth={1280}
					compositionHeight={720}
					controls
					logLevel="trace"
					style={{
						width: '100%',
					}}
				/>

				<LyricsPreviewCard />
			</CardContent>
		</Card>
	);
};
