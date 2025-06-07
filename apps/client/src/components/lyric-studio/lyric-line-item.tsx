import { Trash2, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TimestampControl } from './timestamp-control';
import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface LyricLine {
	id: number;
	text: string;
	timestamp?: number;
}

interface LyricLineItemProps {
	line: LyricLine;
	index: number;
	canUseCurrentTime: boolean;
	onUpdateLine: (id: number, data: Partial<LyricLine>) => void;
	onDeleteLine: (id: number) => void;
	onSetCurrentTime: (id: number) => void;
	onAddLineBelow?: (afterId: number) => void;
	isActive?: boolean;
	isSelected?: boolean;
	onToggleSelection?: (id: number, event: React.MouseEvent) => void;
}

export const LyricLineItem = memo(
	({
		line,
		index,
		canUseCurrentTime,
		onUpdateLine,
		onDeleteLine,
		onSetCurrentTime,
		onAddLineBelow,
		isActive = false,
		isSelected = false,
		onToggleSelection,
	}: LyricLineItemProps) => {
		const handleContainerClick = (event: React.MouseEvent) => {
			if (onToggleSelection && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				onToggleSelection(line.id, event);
			}
		};
		return (
			<div
				className={cn(
					'group relative rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all focus-within:ring-1 focus-within:ring-primary/30 overflow-hidden cursor-pointer',
					{
						'ring-2 ring-primary ring-offset-1': isActive,
						'ring-2 ring-primary ring-offset-2 bg-primary/5':
							isSelected,
					}
				)}
				onClick={handleContainerClick}
			>
				<div className="flex items-center gap-3 p-3">
					<Badge
						variant="outline"
						className="w-8 h-8 flex items-center justify-center rounded-full text-primary font-semibold text-sm shrink-0"
					>
						{index + 1}
					</Badge>
					<div className="flex-1">
						<Input
							id={`text-${line.id}`}
							value={line.text}
							onChange={(e) =>
								onUpdateLine(line.id, { text: e.target.value })
							}
							className="w-full bg-transparent border-none text-base focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0"
							placeholder="Enter lyrics..."
							autoComplete="off"
						/>
					</div>{' '}
					<div className="flex items-center gap-3 shrink-0">
						<TimestampControl
							timestamp={line.timestamp}
							lineId={line.id}
							canSetCurrentTime={canUseCurrentTime}
							onSetCurrentTime={onSetCurrentTime}
						/>

						{onAddLineBelow && (
							<AddLineBelowButton
								lineId={line.id}
								onAddLineBelow={onAddLineBelow}
							/>
						)}

						<RemoveLyricLineButton
							lineId={line.id}
							onDeleteLine={onDeleteLine}
						/>
					</div>
				</div>
			</div>
		);
	}
);

const RemoveLyricLineButton = memo(
	({
		lineId,
		onDeleteLine,
	}: {
		lineId: number;
		onDeleteLine: (id: number) => void;
	}) => {
		return (
			<Button
				variant="outline"
				size="icon"
				onClick={() => onDeleteLine(lineId)}
				className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
				title="Delete line"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		);
	}
);

const AddLineBelowButton = memo(
	({
		lineId,
		onAddLineBelow,
	}: {
		lineId: number;
		onAddLineBelow: (afterId: number) => void;
	}) => {
		return (
			<Button
				variant="outline"
				size="icon"
				onClick={() => onAddLineBelow(lineId)}
				className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				title="Add line below"
			>
				<Plus className="h-4 w-4" />
			</Button>
		);
	}
);
