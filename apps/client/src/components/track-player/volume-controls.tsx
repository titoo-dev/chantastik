import { useTrackPlayer } from '@/hooks/use-track-player';
import { memo } from 'react';
import { Button } from '../ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '../ui/slider';

export const VolumeControls = memo(() => {
	const { audioState, handleVolumeChange, handleMuteToggle } =
		useTrackPlayer();

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				onClick={handleMuteToggle}
			>
				{audioState.isMuted ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>

			<Slider
				value={[audioState.isMuted ? 0 : audioState.volume]}
				min={0}
				max={1}
				step={0.01}
				onValueChange={handleVolumeChange}
				className="w-20"
			/>
		</>
	);
});
