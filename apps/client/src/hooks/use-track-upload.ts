import { useRef } from 'react';
import { useGetAudio } from '@/hooks/use-get-audio';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useTrackUploadStore } from '@/stores/track-upload/store';
import { useAppStore } from '@/stores/app/store';
import { useRemoveCurrentAudio } from './use-remove-current-audio';

export function useTrackUpload() {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const audio = useAppStore((state) => state.audio);

	// Use the extracted hook for removing audio
	const { handleRemoveAudio } = useRemoveCurrentAudio();

	// Use Zustand store for state management
	const {
		audioFile,
		isDragging,
		showConfirmDialog,
		isRetracted,
		isUploading,

		setShowConfirmDialog,
		handleFileChange,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		toggleRetracted,
	} = useTrackUploadStore();

	// Fetch audio metadata using TanStack Query
	const { data: audioMetadata, isLoading: isLoadingAudioMetadata } =
		useGetAudio(audio?.id, () => {
			// Handle audio metadata success
		});

	// File upload mutation
	const { uploadFile, isUploading: fileUploadLoading } = useFileUpload();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileChange(file);
			uploadFile(file);
		}
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
