import { formatPlayerTime } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player/store';
import { memo } from 'react';

export const Duration = memo(() => {
	const duration = usePlayerStore((state) => state.duration);

	return (
		<div className="w-10 text-xs text-muted-foreground text-left">
			{formatPlayerTime(duration)}
		</div>
	);
});
