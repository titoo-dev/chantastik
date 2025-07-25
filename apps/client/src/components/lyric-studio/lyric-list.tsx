import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { LyricLineItem } from './lyric-line-item';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/stores/app/store';
import { Lrc, Runner } from 'lrc-kit';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useShallow } from 'zustand/react/shallow';
import type { LyricLine } from '@/data/types';

type Props = {
	lyricLines: LyricLine[];
	onUpdateLine: (id: number, data: Partial<LyricLine>) => void;
	onDeleteLine: (id: number) => void;
	onSetCurrentTime: (id: number) => void;
	onAddLine: () => void;
	onAddLineBelow?: (afterId: number) => void;
};

export function LyricList({
	lyricLines,
	onUpdateLine,
	onDeleteLine,
	onSetCurrentTime,
	onAddLine,
	onAddLineBelow,
}: Props) {
	const { audioRef } = useAudioRefContext();
	const { generateLRC } = useAppStore(
		useShallow((state) => ({
			generateLRC: state.generateLRC,
		}))
	);

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

	useEffect(() => {
		const audioElement = audioRef.current;

		const handleRunnerUpdate = (event: Event) => {
			const audioElement = event.target as HTMLAudioElement;
			runner.timeUpdate(audioElement.currentTime);
			setActiveIndex(runner.curIndex());
		};

		audioElement?.addEventListener('timeupdate', handleRunnerUpdate);

		return () => {
			audioElement?.removeEventListener('timeupdate', handleRunnerUpdate);
		};
	}, [audioRef, runner]);

	return (
		<div>
			<div className="space-y-3">
				{lyricLines.map((line, index) => (
					<LyricLineItem
						key={line.id}
						line={line}
						index={index}
						onUpdateLine={onUpdateLine}
						onDeleteLine={onDeleteLine}
						onSetCurrentTime={onSetCurrentTime}
						canUseCurrentTime
						isActive={index === activeIndex}
						onAddLineBelow={onAddLineBelow}
					/>
				))}
			</div>
			<div className="flex justify-center mt-6">
				<Button onClick={onAddLine} variant="outline" className="gap-2">
					<PlusCircle className="h-4 w-4" />
					Add Line
				</Button>
			</div>
		</div>
	);
}
