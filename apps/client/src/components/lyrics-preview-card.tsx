import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';
import { useRef } from 'react';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import { SyncedLyrics } from './synced-lyrics';

export function LyricsPreviewCard() {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();
	const containerRef = useRef<HTMLDivElement>(null);
	
	const { lyricLines } = useAppStore(
		useShallow((state) => ({
			lyricLines: state.lyricLines,
		}))
	);
	

	if (lyricLines.length === 0) {
		return (
			<div className="flex items-center justify-center h-60 text-muted-foreground">
				No lyrics to preview
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="lyrics-preview-container bg-background/50 backdrop-blur-sm p-6 overflow-hidden relative"
		>
			<div className="lyrics-preview-gradient" />
			<SyncedLyrics
				audioRef={audioRef}
				videoRef={videoRef}
				lyricLines={lyricLines}
			/>
		</div>
	);
}



