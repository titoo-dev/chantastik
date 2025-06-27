import { usePlayerStore } from "@/stores/player/store";
import { useAudioRefContext } from "./use-audio-ref-context";
import { useShallow } from "zustand/react/shallow";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const useAudioHotkeys = () => {
	const { audioRef } = useAudioRefContext();
	const { position, duration, isPlaying } = usePlayerStore(
		useShallow((state) => ({
			position: state.position,
			duration: state.duration,
			isPlaying: state.isPlaying,
		}))
	);

	const handlePlayPause = useCallback(() => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	}, [audioRef, isPlaying]);

	const handleSeekBackward = useCallback(() => {
		if (!audioRef.current) return;
		const newTime = Math.max(0, position - 10);
		audioRef.current.currentTime = newTime;
	}, [audioRef, position]);

	const handleSeekForward = useCallback(() => {
		if (!audioRef.current) return;
		const newTime = Math.min(duration, position + 10);
		audioRef.current.currentTime = newTime;
	}, [audioRef, duration, position]);

	useHotkeys(
		'space',
		(e) => {
			e.preventDefault();
			handlePlayPause();
		},
		{ enableOnFormTags: false }
	);

	useHotkeys('arrowleft', handleSeekBackward, { enableOnFormTags: false });
	useHotkeys('arrowright', handleSeekForward, { enableOnFormTags: false });
};
