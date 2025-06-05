import { PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { parseLyrics } from '@/remotion/Root';
import { LyricsPreviewCard } from '../lyrics-preview-card';
import { useCallback, useEffect, useMemo } from 'react';
import type { LyricsProps } from '@/remotion/schema';
import { PlayerOnly } from './player';
import { getCoverArtUrl } from '@/data/api';
import { useAppStore } from '@/stores/app/store';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useShallow } from 'zustand/react/shallow';
import { useTrackUploadStore } from '@/stores/track-upload/store';

export const LyricsPlayer = () => {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const { lyricLines, showVideoPreview, showExternalLyrics, showPreview } =
		useAppStore(
			useShallow((state) => ({
				lyricLines: state.lyricLines,
				showVideoPreview: state.showVideoPreview,
				showExternalLyrics: state.showExternalLyrics,
				showPreview: state.showPreview,
			}))
		);

	const audio = useTrackUploadStore((state) => state.audio);

	const { setVideoTime } = useAppStore.getState();

	useEffect(() => {
		if (audioRef.current) {
			setVideoTime({
				timestamp: audioRef.current.currentTime,
				videoRef: videoRef,
			});
		}
	}, [showVideoPreview]);

	const lyricsData = useCallback(() => {
		return parseLyrics(lyricLines);
	}, [lyricLines])();

	const totalFrames = useMemo(() => {
		return lyricsData.length > 0
			? lyricsData[lyricsData.length - 1].endFrame + 30
			: 0;
	}, [lyricsData]);

	const inputProps = useMemo(() => {
		return {
			lyrics: lyricsData,
			backgroundImage: getCoverArtUrl(audio?.id ?? ''),
		} as LyricsProps;
	}, [lyricsData]);

	if (!showVideoPreview || showExternalLyrics || showPreview) {
		return null; // Don't render if video preview is not shown
	}

	return (
		<Card className="pt-0 shadow-none col-span-1">
			<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
				<CardTitle className="flex items-center gap-2 py-2">
					<PlayCircle className="h-5 w-5 text-primary" />
					Lyric Video Player
				</CardTitle>
			</CardHeader>

			<CardContent className="p-6">
				<PlayerOnly
					playerRef={videoRef}
					inputProps={inputProps}
					totalFrames={totalFrames}
				/>
				<LyricsPreviewCard />
			</CardContent>
		</Card>
	);
};
