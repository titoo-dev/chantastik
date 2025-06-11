import { memo } from 'react';
import { Button } from '../ui/button';
import { Pause, Play } from 'lucide-react';
import { usePlayerStore } from '@/stores/player/store';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useCallback } from 'react';

export const PlayPauseButton = memo(() => {
	const { audioRef } = useAudioRefContext();

	const isPlaying = usePlayerStore((state) => state.isPlaying);

	const handlePlayPause = useCallback(() => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	}, [audioRef, isPlaying]);

	return (
		<Button
			variant="outline"
			size="icon"
			className={`h-9 w-9 rounded-full ${isPlaying ? 'text-primary hover:text-primary' : ''}`}
			onClick={handlePlayPause}
		>
			{isPlaying ? (
				<Pause className="h-4 w-4" />
			) : (
				<Play className="h-4 w-4" />
			)}
		</Button>
	);
});
