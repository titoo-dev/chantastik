import { cn } from '@/lib/utils';

type WaveformProps = {
	bars: number[];
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	onBarClick: (index: number) => void;
};

export const Waveform = ({
	bars,
	currentTime,
	duration,
	isPlaying,
	onBarClick,
}: WaveformProps) => (
	<div className="mb-4 flex h-16 items-center gap-0.5">
		{bars.map((height, index) => (
			<div
				key={index}
				className={cn(
					'h-full w-full transition-all duration-300 hover:opacity-70 cursor-pointer',
					index < bars.length * (currentTime / duration || 0)
						? 'bg-primary'
						: 'bg-muted'
				)}
				style={{
					height: `${height * 100}%`,
					opacity:
						isPlaying &&
						index ===
							Math.floor(
								bars.length * (currentTime / duration || 0)
							)
							? '0.8'
							: undefined,
				}}
				onClick={() => onBarClick(index)}
			/>
		))}
	</div>
);
