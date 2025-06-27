import { formatTimestamp } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAppStore } from '@/stores/app/store';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import { Magnet } from 'lucide-react';

// Component for the timestamp control
type TimestampControlProps = {
	timestamp?: number;
	lineId: number;
	canSetCurrentTime: boolean;
	onSetCurrentTime: (id: number) => void;
};

export function TimestampControl({
	timestamp,
	lineId,
	canSetCurrentTime,
	onSetCurrentTime,
}: TimestampControlProps) {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();
	const { jumpToLyricLine } = useAppStore.getState();

	return (
		<div className="flex items-center gap-2 rounded-lg border bg-background/50 backdrop-blur-sm p-2">
			{timestamp !== undefined ? (
				<Button
					onClick={() =>
						jumpToLyricLine({ id: lineId, audioRef, videoRef })
					}
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

			<div className="flex-1" />

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
				<Magnet className="h-4 w-4" />
			</Button>
		</div>
	);
}
