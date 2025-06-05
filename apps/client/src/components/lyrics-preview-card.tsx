import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import type { PlayerRef } from '@remotion/player';
import { Lrc, Runner } from 'lrc-kit';
import type { LyricLine } from './lyric-studio/lyric-line-item';

export function LyricsPreviewCard() {
	const { lyricLines } = useAppStore(
		useShallow((state) => ({
			lyricLines: state.lyricLines,
		}))
	);

	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();
	const containerRef = useRef<HTMLDivElement>(null);

	// If no lyrics, show a placeholder
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

type SyncedLyricsProps = {
	lyricLines: LyricLine[];
	audioRef: React.RefObject<HTMLAudioElement | null>;
	videoRef: React.RefObject<PlayerRef | null>;
};

const SyncedLyrics = memo(
	({ audioRef, videoRef, lyricLines }: SyncedLyricsProps) => {
		const activeLineRef = useRef<HTMLDivElement>(null);

		const { jumpToLyricLine, generateLRC } = useAppStore.getState();

		const [activeIndex, setActiveIndex] = useState<number | null>(null);

		const runner = useMemo(() => {
			const lrcData = generateLRC();

			let lrcContent = `[ti:${lrcData.metadata.title}]\n`;
			lrcContent += `[ar:${lrcData.metadata.artist}]\n`;
			lrcContent += `[al:${lrcData.metadata.album}]\n\n`;

			lrcData.metadata.timestamps.forEach(({ time, text }) => {
				lrcContent += `[${time}]${text}\n`;
			});
			return new Runner(Lrc.parse(lrcContent));
		}, [lyricLines]);

		const handleLineClick = useCallback(
			(line: LyricLine, isActive: boolean) => {
				if (!isActive) {
					jumpToLyricLine({
						id: line.id,
						audioRef: audioRef,
						videoRef: videoRef,
					});
				}
			},
			[jumpToLyricLine, audioRef, videoRef]
		);

		useEffect(() => {
			const audioElement = audioRef.current;

			const handleRunnerUpdate = (event: Event) => {
				const audioElement = event.target as HTMLAudioElement;
				runner.timeUpdate(audioElement.currentTime);
				setActiveIndex(runner.curIndex());
			};

			audioElement?.addEventListener('timeupdate', handleRunnerUpdate);

			return () => {
				audioElement?.removeEventListener(
					'timeupdate',
					handleRunnerUpdate
				);
			};
		}, [audioRef, runner]);

		return (
			<div className="flex flex-col items-center justify-center h-full relative">
				{lyricLines.map((line, index) => {
					const isActive = index === activeIndex;

					return (
						<p
							key={index}
							ref={isActive ? activeLineRef : undefined}
							title={
								isActive ? '' : 'Click to seek to this position'
							}
							className={cn(
								'text-foreground/50 cursor-pointer transition-all md:leading-10',
								{ 'text-primary md:text-2xl': isActive }
							)}
							onClick={() => handleLineClick(line, isActive)}
						>
							{line.text || '(Empty lyric)'}
						</p>
					);
				})}
			</div>
		);
	}
);
