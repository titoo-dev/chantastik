import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { cn, formatPlayerTime } from '@/lib/utils';
import { memo, useEffect, useState } from 'react';

type Props = {
	className?: string;
};

export const CurrentTime = memo(({ className }: Props) => {
	const { audioRef } = useAudioRefContext();

	const [position, setPosition] = useState(0);

	useEffect(() => {
		const audioElement = audioRef.current;

		const onTimeUpdate = (event: Event) => {
			const audioElement = event.target as HTMLAudioElement;
			setPosition(audioElement.currentTime);
		};

		audioElement?.addEventListener('timeupdate', onTimeUpdate);

		return () => {
			audioElement?.removeEventListener('timeupdate', onTimeUpdate);
		};
	}, [audioRef]);

	return (
		<div className={cn("w-10 text-xs text-muted-foreground text-right", className)}>
			{formatPlayerTime(position)}
		</div>
	);
});
