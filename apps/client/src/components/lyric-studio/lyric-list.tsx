import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { LyricLineItem, type LyricLine } from './lyric-line-item';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app/store';
import { Lrc, Runner } from 'lrc-kit';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useShallow } from 'zustand/react/shallow';

export function LyricList({
	lyricLines,
	onUpdateLine,
	onDeleteLine,
	onSetCurrentTime,
	onAddLine,
	onAddLineBelow,
}: {
	lyricLines: LyricLine[];
	onUpdateLine: (id: number, data: Partial<LyricLine>) => void;
	onDeleteLine: (id: number) => void;
	onSetCurrentTime: (id: number) => void;
	onAddLine: () => void;
	onAddLineBelow?: (afterId: number) => void;
}) {
	const { audioRef } = useAudioRefContext();
	const {
		selectedLyricLineIds,
		generateLRC,
		toggleLyricLineSelection,
		clearLyricLineSelection,
		deleteSelectedLyricLines,
		selectAllLyricLines,
	} = useAppStore(
		useShallow((state) => ({
			selectedLyricLineIds: state.selectedLyricLineIds,
			generateLRC: state.generateLRC,
			toggleLyricLineSelection: state.toggleLyricLineSelection,
			clearLyricLineSelection: state.clearLyricLineSelection,
			deleteSelectedLyricLines: state.deleteSelectedLyricLines,
			selectAllLyricLines: state.selectAllLyricLines,
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
	// Keyboard shortcuts handling
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Delete selected lines with Delete or Backspace
			if (
				(event.key === 'Delete' || event.key === 'Backspace') &&
				selectedLyricLineIds.size > 0
			) {
				event.preventDefault();
				deleteSelectedLyricLines();
			}

			// Select all with Ctrl+A (Windows/Linux) or Cmd+A (Mac)
			if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
				event.preventDefault();
				selectAllLyricLines();
			}

			// Clear selection with Escape
			if (event.key === 'Escape' && selectedLyricLineIds.size > 0) {
				event.preventDefault();
				clearLyricLineSelection();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [
		selectedLyricLineIds,
		deleteSelectedLyricLines,
		selectAllLyricLines,
		clearLyricLineSelection,
	]); // Selection management
	const handleToggleSelection = useCallback(
		(id: number, event: React.MouseEvent) => {
			event.stopPropagation();

			// Only handle Ctrl/Cmd+click for individual selection
			if (event.ctrlKey || event.metaKey) {
				toggleLyricLineSelection(id);
			}
		},
		[toggleLyricLineSelection]
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
			audioElement?.removeEventListener('timeupdate', handleRunnerUpdate);
		};
	}, [audioRef, runner]);

	return (
		<div>
			{/* Selection banner at the top */}
			{selectedLyricLineIds.size > 0 && (
				<div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
					<div className="flex items-center justify-between">
						<div className="text-sm text-primary">
							<span className="font-semibold">
								{selectedLyricLineIds.size}
							</span>{' '}
							line(s) selected
						</div>
						<div className="flex items-center gap-2">
							<div className="text-xs text-muted-foreground">
								<kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
									Delete
								</kbd>{' '}
								to remove •{' '}
								<kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
									{navigator.platform.includes('Mac')
										? '⌘'
										: 'Ctrl'}
									+A
								</kbd>{' '}
								to select all •{' '}
								<kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
									Esc
								</kbd>{' '}
								to clear
							</div>
							<Button
								onClick={deleteSelectedLyricLines}
								variant="outline"
								size="sm"
								className="text-destructive hover:text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="h-4 w-4 mr-1" />
								Delete Selected ({selectedLyricLineIds.size})
							</Button>
						</div>
					</div>
				</div>
			)}{' '}
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
						isSelected={selectedLyricLineIds.has(line.id)}
						onToggleSelection={handleToggleSelection}
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
