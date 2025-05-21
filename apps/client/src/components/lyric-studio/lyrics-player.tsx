import { PlayCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAppContext } from '@/hooks/use-app-context';
import { parseLyrics } from '@/remotion/Root';
import { LyricsPreviewCard } from '../lyrics-preview-card';
import { Button } from '../ui/button';
import { useCallback, useMemo, useState } from 'react';
import type { LyricsProps } from '@/remotion/schema';
import { PlayerOnly } from './player';

export const LyricsPlayer = () => {
	// Calculate total duration based on lyrics
	const { showVideoPreview, lyricLines, videoRef } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);

	const lyricsData = useCallback(() => {
		return parseLyrics(lyricLines);
	}, [lyricLines])();

	const totalFrames = useMemo(() => {
		return lyricsData.length > 0
			? lyricsData[lyricsData.length - 1].endFrame + 30
			: 0;
	}, [lyricsData]);

	// extract inputProps from MyComposition
	const inputProps = useMemo(() => {
		return {
			lyrics: lyricsData,
		} as LyricsProps;
	}, [lyricsData]);

	const updateVideoPlayer = useCallback(() => {
		setIsLoading(true);
		// Simulate update process
		setTimeout(() => {
			setIsLoading(false);
		}, 1500);
	}, []);

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

				<div className="flex items-center gap-3">
					<Button
						onClick={updateVideoPlayer}
						variant="outline"
						className="gap-2"
						title="Update video player with current lyrics"
						disabled={isLoading}
					>
						<RotateCcw
							className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
						/>
						Update Video Player
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-6">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-lg border border-border">
						<div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
						<p className="text-muted-foreground">
							Updating video player...
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							This may take a moment
						</p>
					</div>
				) : (
					<PlayerOnly
						playerRef={videoRef}
						inputProps={inputProps}
						totalFrames={totalFrames}
					/>
				)}
				<LyricsPreviewCard />
			</CardContent>
		</Card>
	);
};
