import { memo, useEffect, useState } from 'react';
import { Slider } from '../ui/slider';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '@/stores/player/store';

export const TimeSlider = memo(() => {
	const { audioRef } = useAudioRefContext();

	const { duration, isPlaying } = usePlayerStore(
		useShallow((state) => ({
			duration: state.duration,
			isPlaying: state.isPlaying,
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

	const handleTimeChange = (value: number[]) => {
		if (!audioRef.current || !duration) return;
		const newTime = value[0];
		audioRef.current.currentTime = newTime;
		if (!isPlaying) {
			audioRef.current.play();
		}
	};

	return (
		<div className="flex-1">
			<Slider
				value={[position]}
				min={0}
				max={duration || 100}
				step={0.1}
				onValueChange={handleTimeChange}
				className="hover:cursor-pointer"
			/>
		</div>
	);
});
