import { PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { parseLines } from '@/remotion/Root';
import { LyricsPreviewCard } from '../lyrics-preview-card';
import { useCallback, useMemo } from 'react';
import type { LyricsProps } from '@/remotion/schema';
import { PlayerOnly } from './player';
import { getAudioUrl, getCoverArtUrl } from '@/data/api';
import { useAppStore } from '@/stores/app/store';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useShallow } from 'zustand/react/shallow';
import { useColorFlow } from '@/hooks/use-color-flow';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useRenderVideo } from '@/hooks/use-render-video';
import type { AudioMeta } from '@/data/types';

export const LyricsPlayer = () => {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const theme = useColorFlow();

	const { lyricLines, showVideoPreview, showExternalLyrics } = useAppStore(
		useShallow((state) => ({
			lyricLines: state.lyricLines,
			showVideoPreview: state.showVideoPreview,
			showExternalLyrics: state.showExternalLyrics,
		}))
	);

	const audio = useAppStore((state) => state.audio);

	const renderVideoMutation = useRenderVideo();

	const lyricsData = useCallback(() => {
		return parseLines(lyricLines);
	}, [lyricLines])();

	const totalFrames = useMemo(() => {
		if (lyricsData.length === 0) return 0;

		// Get audio duration in seconds
		const audioDuration = audioRef.current?.duration || 0;

		// Calculate frames based on audio duration (assuming 30 FPS)
		const audioFrames = Math.ceil(audioDuration * 30);

		// Get last lyric end frame
		const lastLyricFrame = lyricsData[lyricsData.length - 1].endFrame;

		// Use the maximum between audio duration and last lyric frame, plus buffer
		return Math.max(audioFrames, lastLyricFrame) + 30;
	}, [lyricsData, audioRef.current?.duration]);

	const inputProps = useMemo(() => {
		return {
			lyrics: lyricsData,
			backgroundImage: getCoverArtUrl(audio?.id ?? ''),
			theme,
		} as LyricsProps;
	}, [lyricsData]);

	const renderInputProps = useMemo(() => {
		return {
			lyrics: lyricsData,
			backgroundImage: getCoverArtUrl(audio?.id ?? ''),
			audioSrc: getAudioUrl(audio?.id ?? ''),
		} as LyricsProps;
	}, [lyricsData]);

	const handleRenderVideo = useCallback(() => {
		const storedAudioMetadata =
			localStorage.getItem(`currentAudioMetadata`);

		if (!storedAudioMetadata || lyricsData.length === 0) {
			toast.error('Cannot render video', {
				description:
					'Please ensure audio is loaded and lyrics are added',
			});
			return;
		}

		const audioMetadata: AudioMeta = JSON.parse(storedAudioMetadata);

		const fileName = `${audioMetadata.metadata?.title || 'lyrics'}-${audioMetadata.metadata?.artist || 'unknown'}.mp4`;

		renderVideoMutation.mutate({
			compositionId: 'LyricsPlayer',
			inputProps: renderInputProps,
			outputFileName: fileName,
			totalFrames: totalFrames,
		});
	}, [lyricsData, renderInputProps, renderVideoMutation, totalFrames]);

	if (!showVideoPreview || showExternalLyrics) {
		return null; // Don't render if video preview is not shown
	}

	return (
		<Card className="pt-0 shadow-none col-span-1">
			<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
				<CardTitle className="flex items-center gap-2 py-2">
					<PlayCircle className="h-5 w-5 text-primary" />
					Lyric Video Player
				</CardTitle>
				<Button
					variant="default"
					size="sm"
					className="ml-auto"
					onClick={handleRenderVideo}
					disabled={
						renderVideoMutation.isPending ||
						!audio?.id ||
						lyricsData.length === 0
					}
				>
					{renderVideoMutation.isPending ? 'Rendering...' : 'Render'}
				</Button>
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
