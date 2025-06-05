import { useTrackPlayer } from '@/hooks/use-track-player';
import { memo } from 'react';
import { Slider } from '../ui/slider';

export const TimeSlider = memo(() => {
	const { audioState, handleTimeChange } = useTrackPlayer();

	return (
		<div className="flex-1">
			<Slider
				value={[audioState.position]}
				min={0}
				max={audioState.duration || 100}
				step={0.1}
				onValueChange={handleTimeChange}
				className="hover:cursor-pointer"
			/>
		</div>
	);
});
