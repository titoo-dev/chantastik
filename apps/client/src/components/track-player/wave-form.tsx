import { useTrackPlayer } from '@/hooks/use-track-player';
import { cn } from '@/lib/utils';

export const Waveform = () => {
	const { audioState, waveBars, handleWaveBarClick } = useTrackPlayer();

	return (
		<div className="mb-4 flex h-16 items-center gap-0.5">
			{waveBars.map((height, index) => (
				<div
					key={index}
					className={cn(
						'h-full w-full transition-all duration-300 hover:opacity-70 cursor-pointer',
						index <
							waveBars.length *
								(audioState.position / audioState.duration || 0)
							? 'bg-primary'
							: 'bg-muted'
					)}
					style={{
						height: `${height * 100}%`,
						opacity:
							audioState.isPlaying &&
							index ===
								Math.floor(
									waveBars.length *
										(audioState.position /
											audioState.duration || 0)
								)
								? '0.8'
								: undefined,
					}}
					onClick={() => handleWaveBarClick(index)}
				/>
			))}
		</div>
	);
};
