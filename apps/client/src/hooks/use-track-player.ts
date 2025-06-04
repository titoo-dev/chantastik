import { useState, useEffect } from 'react';
import { useAppContext } from './use-app-context';
import { useHotkeys } from 'react-hotkeys-hook';
import { useQueryClient } from '@tanstack/react-query';

export type AudioPlayerState = {
	isPlaying: boolean;
	duration: number;
	currentTime: number;
	volume: number;
	isMuted: boolean;
};

export function useTrackPlayer() {
	const queryClient = useQueryClient();
	const { audioRef, videoRef, setVideoTime, setTrackLoaded } =
		useAppContext();
	const [waveBars] = useState(
		Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2)
	);
	const [audioState, setAudioState] = useState<AudioPlayerState>({
		isPlaying: false,
		duration: 0,
		currentTime: 0,
		volume: 1,
		isMuted: false,
	});

	// Audio event handlers
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlers = {
			loadedmetadata: () => {
				setAudioState((oldState) => ({
					...oldState,
					duration: audio.duration,
					volume: audio.volume,
					isMuted: audio.muted,
				}));
				setTrackLoaded(true);
				queryClient.invalidateQueries({ queryKey: ['projects'] });
			},
			timeupdate: () => {
				setAudioState((oldState) => ({
					...oldState,
					currentTime: audio.currentTime,
				}));
			},
			ended: () => {
				setAudioState((s) => ({
					...s,
					isPlaying: false,
					currentTime: 0,
				}));
				videoRef.current?.pause();
			},
			play: () => {
				setAudioState((s) => ({ ...s, isPlaying: true }));
				setVideoTime(audioRef.current?.currentTime || 0);
				videoRef.current?.play();
			},
			pause: () => {
				setAudioState((s) => ({ ...s, isPlaying: false }));
				videoRef.current?.pause();
			},
		};

		Object.entries(handlers).forEach(([event, handler]) => {
			audio.addEventListener(event, handler);
		});

		return () => {
			Object.entries(handlers).forEach(([event, handler]) => {
				audio?.removeEventListener(event, handler);
			});
		};
	}, [audioRef, videoRef, setVideoTime]);

	const pauseVideo = () => {
		if (videoRef.current) {
			videoRef.current.pause();
		}
	};

	const handlePlayPause = () => {
		if (audioRef.current) {
			if (audioState.isPlaying) {
				audioRef.current.pause();
			} else {
				setVideoTime(audioState.currentTime);
				audioRef.current.play();
			}
		}
	};

	const handleTimeChange = (value: number[]) => {
		const newTime = value[0];
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
			if (!audioState.isPlaying) {
				audioRef.current.play();
			}
		}
	};

	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		if (audioRef.current) {
			audioRef.current.volume = newVolume;
			setAudioState((s) => ({ ...s, volume: newVolume }));
		}
	};

	const handleMuteToggle = () => {
		if (audioRef.current) {
			audioRef.current.muted = !audioState.isMuted;
			setAudioState((s) => ({ ...s, isMuted: !s.isMuted }));
		}
	};

	const handleWaveBarClick = (index: number) => {
		if (audioRef.current && audioState.duration) {
			const newTime = (index / waveBars.length) * audioState.duration;
			audioRef.current.currentTime = newTime;
		}
	};

	// Hotkeys
	useHotkeys(
		'space',
		(e) => {
			e.preventDefault();
			handlePlayPause();
		},
		{ enableOnFormTags: false }
	);

	useHotkeys(
		'arrowleft',
		() => {
			if (audioRef.current) {
				const newTime = Math.max(0, audioState.currentTime - 10);
				audioRef.current.currentTime = newTime;
			}
		},
		{ enableOnFormTags: false }
	);

	useHotkeys(
		'arrowright',
		() => {
			if (audioRef.current) {
				const newTime = Math.min(
					audioState.duration,
					audioState.currentTime + 10
				);
				audioRef.current.currentTime = newTime;
			}
		},
		{ enableOnFormTags: false }
	);

	return {
		audioState,
		waveBars,
		handlePlayPause,
		handleTimeChange,
		handleVolumeChange,
		handleMuteToggle,
		handleWaveBarClick,
		pauseVideo,
	};
}
