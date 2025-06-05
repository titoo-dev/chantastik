import { useTrackPlayer } from '@/hooks/use-track-player';
import { formatPlayerTime } from '@/lib/utils';
import { memo } from 'react';

export const Duration = memo(() => {
	const { audioState } = useTrackPlayer();

	return (
		<div className="w-10 text-xs text-muted-foreground text-left">
			{formatPlayerTime(audioState.duration)}
		</div>
	);
});
