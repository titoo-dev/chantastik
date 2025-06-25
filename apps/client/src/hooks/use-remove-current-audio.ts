import { useAudioRefContext } from './use-audio-ref-context';
import { useVideoRefContext } from './use-video-ref-context';
import { useAppStore } from '@/stores/app/store';
import { usePlayerStore } from '@/stores/player/store';
import { useTrackUploadStore } from '@/stores/track-upload/store';
import { useFileUpload } from '@/hooks/use-file-upload';

export function useRemoveCurrentAudio() {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const { setAudio, setTrackLoaded, resetAllStatesAndPlayers } =
		useAppStore.getState();
	const { reset: resetAudioPlayer } = usePlayerStore.getState();
	const { reset: resetTrackUpload } = useTrackUploadStore.getState();
	const { reset: resetFileUpload } = useFileUpload();

	const handleRemoveAudio = () => {
		// Clear audio from app state
		setAudio(undefined);

		// Reset audio element
		if (audioRef?.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
			audioRef.current.load();
			audioRef.current.currentTime = 0;
		}

		// Reset video element
		if (videoRef?.current) {
			videoRef.current.pause();
			videoRef.current.seekTo(0);
		}

		// Reset all related states
		setTrackLoaded(false);
		resetAllStatesAndPlayers();
		resetTrackUpload();
		resetFileUpload();
		resetAudioPlayer();
	};

	return {
		handleRemoveAudio,
	};
}
