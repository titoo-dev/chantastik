import { cn, formatPlayerTime } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player/store';
import { memo } from 'react';

type Props = {
	className?: string;
};

export const Duration = memo(({ className }: Props) => {
	const duration = usePlayerStore((state) => state.duration);

	return (
		<div className={cn("w-10 text-xs text-muted-foreground text-left", className)}>
			{formatPlayerTime(duration)}
		</div>
	);
});
