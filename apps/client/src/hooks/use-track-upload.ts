import { useRef } from 'react';
import { useGetAudio } from '@/hooks/use-get-audio';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useTrackUploadStore } from '@/stores/track-upload/store';
import { useAudioRefContext } from './use-audio-ref-context';
import { useAppStore } from '@/stores/app/store';
import { useVideoRefContext } from './use-video-ref-context';

export function useTrackUpload() {
	const { videoRef } = useVideoRefContext();
	const { audioRef } = useAudioRefContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { setTrackLoaded, resetAllStatesAndPlayers } = useAppStore.getState();

	// Use Zustand store for state management
	const {
		audioFile,
		isDragging,
		showConfirmDialog,
		isRetracted,
		audio,
		isUploading,

		setShowConfirmDialog,
		handleFileChange,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		toggleRetracted,
		reset,
		setAudio,
	} = useTrackUploadStore();

	// Fetch audio metadata using TanStack Query
	const { data: audioMetadata, isLoading: isLoadingAudioMetadata } =
		useGetAudio(audio?.id, () => {
			// Handle audio metadata success
		});

	// File upload mutation
	const {
		uploadFile,
		isUploading: fileUploadLoading,
		reset: resetFileUpload,
	} = useFileUpload();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileChange(file);
			uploadFile(file);
		}
	};

	const handleRemoveAudio = () => {
		setAudio(undefined);
		if (audioRef?.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
			audioRef.current.load();
			audioRef.current.currentTime = 0;
		}
		if (videoRef?.current) {
			videoRef.current.pause();
			videoRef.current.seekTo(0);
		}
		setTrackLoaded(false);
		resetAllStatesAndPlayers();
		reset();
		resetFileUpload();
	};

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	const dragHandlers = {
		onDragEnter: handleDragEnter,
		onDragLeave: handleDragLeave,
		onDragOver: handleDragOver,
		onDrop: (e: React.DragEvent) => handleDrop(e, uploadFile),
	};

	return {
		// State
		audioFile,
		isDragging,
		showConfirmDialog,
		isRetracted,
		audio,
		audioMetadata,
		isUploading: isUploading || fileUploadLoading,
		isLoadingAudioMetadata,
		fileInputRef,

		// Actions
		handleInputChange,
		handleRemoveAudio,
		handleBrowseClick,
		toggleRetracted,
		setShowConfirmDialog,

		// Drag handlers
		dragHandlers,
	};
}
