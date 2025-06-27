import { useAppStore } from "@/stores/app/store";
import { usePlayerStore } from "@/stores/player/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, type ReactEventHandler } from "react";
import { useAudioRefContext } from "./use-audio-ref-context";
import { useVideoRefContext } from "./use-video-ref-context";
import type { AudioMeta } from "@/data/types";
import { useShallow } from "zustand/react/shallow";
import { getCoverArtUrl } from "@/data/api";

type AudioEventHandlers = {
    onTimeUpdate: ReactEventHandler<HTMLAudioElement>;
    onLoadedMetadata: ReactEventHandler<HTMLAudioElement>;
    onError: ReactEventHandler<HTMLAudioElement>;
    onEnded: ReactEventHandler<HTMLAudioElement>;
    onPlay: ReactEventHandler<HTMLAudioElement>;
    onPause: ReactEventHandler<HTMLAudioElement>;
    onSeeked: ReactEventHandler<HTMLAudioElement>;
};

export const useAudioEventHandlers = (): AudioEventHandlers => {
	const queryClient = useQueryClient();
	const { setDuration, setPosition, setIsPlaying } =
		usePlayerStore.getState();
	const { setTrackLoaded } = useAppStore.getState();
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const audio = useAppStore((state) => state.audio);
	const { volume, position } = usePlayerStore(
		useShallow((state) => ({
			volume: state.volume,
			position: state.position,
		}))
	);

	const updateNavigatorMetadata = useCallback(() => {
		const storedAudioMetadata =
			localStorage.getItem(`currentAudioMetadata`);
		if (!storedAudioMetadata) return null;

		const audioMetadata: AudioMeta = JSON.parse(storedAudioMetadata);

		if ('mediaSession' in navigator && audio?.id) {
			try {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: audioMetadata?.metadata?.title || '',
					artist: audioMetadata?.metadata?.artist || '',
					artwork: [
						{
							src: getCoverArtUrl(audioMetadata?.id),
							type: 'image/jpeg',
						},
					],
				});
			} catch (error) {
				console.error('Error updating media session metadata:', error);
			}
		}
	}, [audio?.id, audio?.metadata?.title, audio?.metadata?.artist]);

	const setVideoTime = useCallback(
		(timestamp: number) => {
			if (videoRef.current) {
				const fps = 30; // Using the same FPS as in Root.tsx
				const frame = Math.floor(timestamp * fps);
				videoRef.current.seekTo(frame);
			}
		},
		[videoRef]
	);

	const onTimeUpdate: ReactEventHandler<HTMLAudioElement> = useCallback(
		(event) => {
			const audioElement = event.target as HTMLAudioElement;
			setPosition(audioElement.currentTime);
		},
		[setPosition]
	);

	const onLoadedMetadata: ReactEventHandler<HTMLAudioElement> = useCallback(
		(event) => {
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
		},
		[
			setDuration,
			volume,
			position,
			setTrackLoaded,
			updateNavigatorMetadata,
			queryClient,
		]
	);

	const onError: ReactEventHandler<HTMLAudioElement> = useCallback(
		(event) => {
			console.error(
				'Audio error:',
				(event.target as HTMLAudioElement).error
			);
		},
		[]
	);

	const onEnded: ReactEventHandler<HTMLAudioElement> = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
		}
		setPosition(0);
		setIsPlaying(false);
		videoRef.current?.pause();
	}, [audioRef, setPosition, setIsPlaying, videoRef]);

	const onPlay: ReactEventHandler<HTMLAudioElement> = useCallback(() => {
		setIsPlaying(true);
		setVideoTime(position);
		videoRef.current?.play();
		updateNavigatorMetadata();
	}, [
		setIsPlaying,
		setVideoTime,
		position,
		videoRef,
		updateNavigatorMetadata,
	]);

	const onPause: ReactEventHandler<HTMLAudioElement> = useCallback(() => {
		setIsPlaying(false);
		videoRef.current?.pause();
		updateNavigatorMetadata();
	}, [setIsPlaying, videoRef, updateNavigatorMetadata]);

	const onSeeked: ReactEventHandler<HTMLAudioElement> = useCallback(
		(event) => {
			const audioElement = event.target as HTMLAudioElement;
			setPosition(audioElement.currentTime);
			setVideoTime(audioElement.currentTime);
			if (!audioElement.paused) {
				videoRef.current?.play();
			}
		},
		[setPosition, setVideoTime, videoRef]
	);

	return {
		onTimeUpdate,
		onLoadedMetadata,
		onError,
		onEnded,
		onPlay,
		onPause,
		onSeeked,
	};
};
