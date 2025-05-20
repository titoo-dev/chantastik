import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { LyricLineItem, type LyricLine } from './lyric-line-item';

export function LyricList({
	lyricLines,
	onUpdateLine,
	onDeleteLine,
	onSetCurrentTime,
	onAddLine,
}: {
	lyricLines: LyricLine[];
	onUpdateLine: (id: number, data: Partial<LyricLine>) => void;
	onDeleteLine: (id: number) => void;
	onSetCurrentTime: (id: number) => void;
	onAddLine: () => void;
}) {
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
					/>
				))}
			</div>

			<div className="flex justify-center mt-6 gap-3">
				<Button onClick={onAddLine} variant="outline" className="gap-2">
					<PlusCircle className="h-4 w-4" />
					Add Line
				</Button>
			</div>
		</div>
	);
}
