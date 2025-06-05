import { useState } from 'react';
import { usePlayerStore } from '@/stores/player/store';
import { useShallow } from 'zustand/react/shallow';
import { useAudioRefContext } from './use-audio-ref-context';

export type AudioPlayerState = {
	isPlaying: boolean;
	duration: number;
	currentTime: number;
	volume: number;
	isMuted: boolean;
};

export function useTrackPlayer() {
	const { audioRef } = useAudioRefContext();
	const [waveBars] = useState(
		Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2)
	);
	const { setVolume, setMuted } = usePlayerStore.getState();

	const { volume, position, duration, isPlaying, isMuted } = usePlayerStore(
		useShallow((state) => ({
			src: state.src,
			volume: state.volume,
			position: state.position,
			currentTrackId: state.currentTrackId,
			duration: state.duration,
			isPlaying: state.isPlaying,
			isMuted: state.muted,
		}))
	);

	const handlePlayPause = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	};

	const handleTimeChange = (value: number[]) => {
		if (!audioRef.current || !duration) return;
		const newTime = value[0];
		audioRef.current.currentTime = newTime;
		if (!isPlaying) {
			audioRef.current.play();
		}
	};

	const handleVolumeChange = (value: number[]) => {
		if (!audioRef.current) return;
		const newVolume = value[0];
		audioRef.current.volume = newVolume;
		setVolume(newVolume);
	};

	const handleMuteToggle = () => {
		if (!audioRef.current) return;
		audioRef.current.muted = !isMuted;
		setMuted(!isMuted);
	};

	const handleWaveBarClick = (index: number) => {
		if (!audioRef.current || !duration || waveBars.length === 0) return;
		const newTime = (index / waveBars.length) * duration;
		audioRef.current.currentTime = newTime;
	};

	return {
		audioState: {
			isPlaying,
			duration,
			position,
			volume,
			isMuted,
		},
		waveBars,
		handlePlayPause,
		handleTimeChange,
		handleVolumeChange,
		handleMuteToggle,
		handleWaveBarClick,
	};
}
