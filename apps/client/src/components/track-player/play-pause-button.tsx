import { useTrackPlayer } from '@/hooks/use-track-player';
import { memo } from 'react';
import { Button } from '../ui/button';
import { Pause, Play } from 'lucide-react';

export const PlayPauseButton = memo(() => {
	const { audioState, handlePlayPause } = useTrackPlayer();

	return (
		<Button
			variant="outline"
			size="icon"
			className={`h-9 w-9 rounded-full ${audioState.isPlaying ? 'text-primary hover:text-primary' : ''}`}
			onClick={handlePlayPause}
		>
			{audioState.isPlaying ? (
				<Pause className="h-4 w-4" />
			) : (
				<Play className="h-4 w-4" />
			)}
		</Button>
	);
});
