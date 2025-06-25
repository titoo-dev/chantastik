import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
type TrackUploadState = {
	// State
	audioFile: File | null;
	isDragging: boolean;
	showConfirmDialog: boolean;
	isRetracted: boolean;
	isUploading: boolean;

	// Actions
	setAudioFile: (file: File | null) => void;
	setIsDragging: (isDragging: boolean) => void;
	setShowConfirmDialog: (show: boolean) => void;
	setIsRetracted: (retracted: boolean) => void;
	setIsUploading: (uploading: boolean) => void;

	// Complex actions
	handleFileChange: (file: File) => void;
	handleDragEnter: (e: React.DragEvent) => void;
	handleDragLeave: (e: React.DragEvent) => void;
	handleDragOver: (e: React.DragEvent) => void;
	handleDrop: (
		e: React.DragEvent,
		onFileUpload?: (file: File) => void
	) => void;
	toggleRetracted: () => void;
	reset: () => void;
};

export const useTrackUploadStore = create<TrackUploadState>()(
	devtools(
		(set, get) => ({
			// Initial state
			audioFile: null,
			isDragging: false,
			showConfirmDialog: false,
			isRetracted: false,
			isUploading: false,

			// Basic setters
			setAudioFile: (audioFile) => set({ audioFile }),
			setIsDragging: (isDragging) => set({ isDragging }),
			setShowConfirmDialog: (showConfirmDialog) =>
				set({ showConfirmDialog }),
			setIsRetracted: (isRetracted) => set({ isRetracted }),

			setIsUploading: (isUploading) => set({ isUploading }),

			// Complex actions
			handleFileChange: (file) => {
				set({ audioFile: file });
			},

			handleDragEnter: (e) => {
				e.preventDefault();
				e.stopPropagation();
				set({ isDragging: true });
			},

			handleDragLeave: (e) => {
				e.preventDefault();
				e.stopPropagation();
				set({ isDragging: false });
			},

			handleDragOver: (e) => {
				e.preventDefault();
				e.stopPropagation();
				const { isDragging } = get();
				if (!isDragging) {
					set({ isDragging: true });
				}
			},

			handleDrop: (e, onFileUpload) => {
				e.preventDefault();
				e.stopPropagation();
				set({ isDragging: false });

				const file = e.dataTransfer.files?.[0];
				if (file && file.type.startsWith('audio/')) {
					set({ audioFile: file });
					onFileUpload?.(file);
				}
			},

			toggleRetracted: () => {
				const { isRetracted } = get();
				set({ isRetracted: !isRetracted });
			},

			reset: () => {
				set({
					audioFile: null,
					isDragging: false,
					showConfirmDialog: false,
					isRetracted: false,
					isUploading: false,
				});
			},
		}),
		{
			name: 'track-upload-store',
		}
	)
);
