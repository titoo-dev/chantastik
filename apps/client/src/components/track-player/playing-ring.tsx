import { usePlayerStore } from '@/stores/player/store';
import { memo } from 'react';

export const PlayingRing = memo(() => {
	const isPlaying = usePlayerStore((state) => state.isPlaying);

	return (
		<div
			className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ease-in-out ${
				isPlaying
					? 'ring-2 ring-primary/70 ring-offset-2 dark:ring-offset-background opacity-100'
					: 'ring-0 ring-transparent ring-offset-0 opacity-0'
			}`}
		/>
	);
});
