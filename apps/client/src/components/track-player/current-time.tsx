import { useTrackPlayer } from '@/hooks/use-track-player';
import { formatPlayerTime } from '@/lib/utils';
import { memo } from 'react';

export const CurrentTime = memo(() => {
	const { audioState } = useTrackPlayer();

	return (
		<div className="w-10 text-xs text-muted-foreground text-right">
			{formatPlayerTime(audioState.currentTime)}
		</div>
	);
});
