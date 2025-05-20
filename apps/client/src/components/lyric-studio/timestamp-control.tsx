import { formatTimestamp } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAppContext } from '@/hooks/use-app-context';

// Component for the timestamp control
interface TimestampControlProps {
	timestamp?: number;
	lineId: number;
	canSetCurrentTime: boolean;
	onSetCurrentTime: (id: number) => void;
}

export function TimestampControl({
	timestamp,
	lineId,
	canSetCurrentTime,
	onSetCurrentTime,
}: TimestampControlProps) {
	const { jumpToLyricLine } = useAppContext();

	return (
		<div className="flex items-center gap-2 rounded-lg border bg-background/50 backdrop-blur-sm p-2">
			{timestamp !== undefined ? (
				<Button
					onClick={() => jumpToLyricLine(lineId)}
					variant="ghost"
					className="flex items-center gap-2 hover:bg-primary/10 rounded-sm px-2 py-2 transition-colors"
					title="Jump to this timestamp"
				>
					<span className="w-20 text-center text-sm font-mono">
						{formatTimestamp(timestamp)}
					</span>
				</Button>
			) : (
				<Button
					variant="outline"
					className="flex items-center gap-2 px-2 py-2 opacity-70 cursor-default"
					disabled
				>
					<span className="w-20 text-center text-sm font-mono text-muted-foreground">
						--:--:--
					</span>
				</Button>
			)}

			<Button
				onClick={() => onSetCurrentTime(lineId)}
				variant="ghost"
				size="icon"
				className={!canSetCurrentTime ? 'opacity-50' : ''}
				title={
					canSetCurrentTime
						? 'Set current time as timestamp'
						: 'Current time would break the ascending sequence'
				}
				disabled={!canSetCurrentTime}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9 4H5C4.44772 4 4 4.44772 4 5V9"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M15 4H19C19.5523 4 20 4.44772 20 5V9"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M9 20H5C4.44772 20 4 19.5523 4 19V15"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M15 20H19C19.5523 20 20 19.5523 20 19V15"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<circle
						cx="12"
						cy="12"
						r="3"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</svg>
			</Button>
		</div>
	);
}
