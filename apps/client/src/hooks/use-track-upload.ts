import { useState, useRef, useEffect } from 'react';
import { preloadImage } from '@remotion/preload';
import { useAppContext } from '@/hooks/use-app-context';
import { getCoverArtUrl } from '@/data/api';
import { useGetAudio } from '@/hooks/use-get-audio';
import { useFileUpload } from '@/hooks/use-file-upload';

export function useTrackUpload() {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isRetracted, setIsRetracted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		setTrackLoaded,
		audioRef,
		resetAllStatesAndPlayers,
		audioId,
		updateAudioId,
	} = useAppContext();

	// Preload cover art when audio ID changes
	useEffect(() => {
		if (audioId) {
			preloadImage(getCoverArtUrl(audioId));
		}
	}, [audioId]);

	// Fetch audio metadata using TanStack Query
	const { data: audioMetadata, isLoading: isLoadingAudioMetadata } =
		useGetAudio(audioId, () => {
			// Handle audio metadata success
		});

	// File upload mutation
	const { uploadFile, isUploading, reset } = useFileUpload();

	const handleFileChange = (file: File) => {
		setAudioFile(file);
		uploadFile(file);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileChange(file);
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) {
			setIsDragging(true);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file && file.type.startsWith('audio/')) {
			handleFileChange(file);
		}
	};

	const handleRemoveAudio = () => {
		setAudioFile(null);
		updateAudioId(undefined);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
		}
		setTrackLoaded(false);
		resetAllStatesAndPlayers();
		reset();
	};

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	const toggleRetracted = () => {
		setIsRetracted(!isRetracted);
	};

	const dragHandlers = {
		onDragEnter: handleDragEnter,
		onDragLeave: handleDragLeave,
		onDragOver: handleDragOver,
		onDrop: handleDrop,
	};

	return {
		// State
		audioFile,
		isDragging,
		showConfirmDialog,
		isRetracted,
		audioId,
		audioMetadata,
		isUploading,
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
