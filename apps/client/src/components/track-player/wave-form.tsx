import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player/store';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const Waveform = () => {
	const { audioRef } = useAudioRefContext();

	const { duration, isPlaying, waveBars } = usePlayerStore(
		useShallow((state) => ({
			duration: state.duration,
			isPlaying: state.isPlaying,
			waveBars: state.waveBars,
		}))
	);

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

	const handleWaveBarClick = (index: number) => {
		if (!audioRef.current || !duration || waveBars.length === 0) return;
		const newTime = (index / waveBars.length) * duration;
		audioRef.current.currentTime = newTime;
	};

	return (
		<div className="mb-4 flex h-16 items-center gap-0.5">
			{waveBars.map((height, index) => (
				<div
					key={index}
					className={cn(
						'h-full w-full transition-all duration-300 hover:opacity-70 cursor-pointer',
						index < waveBars.length * (position / duration || 0)
							? 'bg-primary'
							: 'bg-muted'
					)}
					style={{
						height: `${height * 100}%`,
						opacity:
							isPlaying &&
							index ===
								Math.floor(
									waveBars.length * (position / duration || 0)
								)
								? '0.8'
								: undefined,
					}}
					onClick={() => handleWaveBarClick(index)}
				/>
			))}
		</div>
	);
};
