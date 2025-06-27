import type { LyricLine } from "@/data/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app/store";
import type { PlayerRef } from "@remotion/player";
import { Lrc, Runner } from "lrc-kit";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
	lyricLines: LyricLine[];
	audioRef: React.RefObject<HTMLAudioElement | null>;
	videoRef: React.RefObject<PlayerRef | null>;
};

export const SyncedLyrics = memo(
	({ audioRef, videoRef, lyricLines }: Props) => {
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
								'text-foreground/50 cursor-pointer transition-all duration-500 ease-out md:leading-10 text-center transform',
								{
									'text-primary md:text-2xl scale-105 font-medium':
										isActive,
									'hover:text-foreground/70 hover:scale-102':
										!isActive,
								}
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
