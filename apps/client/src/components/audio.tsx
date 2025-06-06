import { getAudioUrl, getCoverArtUrl } from '@/data/api';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useVideoRefContext } from '@/hooks/use-video-ref-context';
import { useAppStore } from '@/stores/app/store';
import { usePlayerStore } from '@/stores/player/store';
import { useTrackUploadStore } from '@/stores/track-upload/store';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useEffect, type ReactEventHandler } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';

export const Audio = memo(() => {
	const queryClient = useQueryClient();
	const { setDuration, setPosition, setVolume, setMuted, setIsPlaying } =
		usePlayerStore.getState();
	const { setTrackLoaded } = useAppStore.getState();

	const audio = useTrackUploadStore((state) => state.audio);

	const { volume, position, currentTrackId, duration, isPlaying } =
		usePlayerStore(
			useShallow((state) => ({
				volume: state.volume,
				position: state.position,
				currentTrackId: state.currentTrackId,
				duration: state.duration,
				isPlaying: state.isPlaying,
			}))
		);

	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const updateNavigatorMetadata = useCallback(() => {
		if ('mediaSession' in navigator && currentTrackId) {
			try {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: audio?.metadata?.title || '',
					artist: audio?.metadata?.artist || '',
					artwork: [
						{
							src: getCoverArtUrl(audio?.id),
							type: 'image/jpeg',
						},
					],
				});
			} catch (error) {
				console.error('Error updating media session metadata:', error);
			}
		}
	}, [audio?.id]);

	const setVideoTime = (timestamp: number) => {
		if (videoRef.current) {
			const fps = 30; // Using the same FPS as in Root.tsx
			const frame = Math.floor(timestamp * fps);
			videoRef.current.seekTo(frame);
		}
	};

	const onTimeUpdate: ReactEventHandler<HTMLAudioElement> = (event) => {
		const audioElement = event.target as HTMLAudioElement;
		setPosition(audioElement.currentTime);
	};

	const onLoadedMetadata: ReactEventHandler<HTMLAudioElement> = (event) => {
		const audioElement = event.target as HTMLAudioElement;
		setDuration(audioElement.duration);
		audioElement.volume = volume;
		try {
			audioElement.currentTime = position;
		} catch (err) {
			console.error('Error setting audio position:', err);
		}

		setTrackLoaded(true);

		updateNavigatorMetadata();
		queryClient.invalidateQueries({ queryKey: ['projects'] });
	};

	const onError: ReactEventHandler<HTMLAudioElement> = (event) => {
		console.error('Audio error:', (event.target as HTMLAudioElement).error);
	};

	const onEnded: ReactEventHandler<HTMLAudioElement> = () => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
		}
		setPosition(0);
		setIsPlaying(false);
		videoRef.current?.pause();
	};

	const onPlay: ReactEventHandler<HTMLAudioElement> = () => {
		setIsPlaying(true);
		setVideoTime(position);
		videoRef.current?.play();
		updateNavigatorMetadata();
	};

	const onPause: ReactEventHandler<HTMLAudioElement> = () => {
		setIsPlaying(false);
		videoRef.current?.pause();
		updateNavigatorMetadata();
	};

	// on seek
	const onSeek: ReactEventHandler<HTMLAudioElement> = useCallback(
		(event) => {
			const audioElement = event.target as HTMLAudioElement;
			setPosition(audioElement.currentTime);
			setVideoTime(audioElement.currentTime);
			if (!audioElement.paused) {
				videoRef.current?.play();
			}
		},
		[setPosition, setVideoTime]
	);

	useEffect(() => {
		const typedRef = audioRef;

		if (!typedRef.current) return;

		const handleVolumeChange = (e: Event) => {
			const audioEl = e.target as HTMLAudioElement;
			setVolume(audioEl.volume);
			setMuted(audioEl.muted);
		};

		typedRef.current.addEventListener('volumechange', handleVolumeChange);

		return () => {
			if (typedRef.current) {
				typedRef.current.removeEventListener(
					'volumechange',
					handleVolumeChange
				);
			}
		};
	}, [audioRef, setMuted, setVolume]);

	const handlePlayPause = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
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
			if (!audioRef.current) return;
			const newTime = Math.max(0, position - 10);
			audioRef.current.currentTime = newTime;
		},
		{ enableOnFormTags: false }
	);

	useHotkeys(
		'arrowright',
		() => {
			if (!audioRef.current) return;
			const newTime = Math.min(duration, position + 10);
			audioRef.current.currentTime = newTime;
		},
		{ enableOnFormTags: false }
	);

	return (
		<audio
			src={getAudioUrl(audio?.id ?? '')}
			onPlay={onPlay}
			ref={audioRef}
			onPause={onPause}
			onEnded={onEnded}
			onError={onError}
			onSeeked={onSeek}
			title={audio?.metadata?.title}
			onTimeUpdate={onTimeUpdate}
			onLoadedMetadata={onLoadedMetadata}
			preload="auto"
			className="hidden"
		/>
	);
});
