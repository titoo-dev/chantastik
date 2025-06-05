import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { preloadImage } from '@remotion/preload';
import { getCoverArtUrl } from '@/data/api';
import type { AudioMeta } from '@/data/types';

interface TrackUploadState {
	// State
	audioFile: File | null;
	isDragging: boolean;
	showConfirmDialog: boolean;
	isRetracted: boolean;
	audio: AudioMeta | undefined;
	isUploading: boolean;

	// Actions
	setAudioFile: (file: File | null) => void;
	setIsDragging: (isDragging: boolean) => void;
	setShowConfirmDialog: (show: boolean) => void;
	setIsRetracted: (retracted: boolean) => void;
	setAudio: (audio: AudioMeta | undefined) => void;
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
}

export const useTrackUploadStore = create<TrackUploadState>()(
	devtools(
		(set, get) => ({
			// Initial state
			audioFile: null,
			isDragging: false,
			showConfirmDialog: false,
			isRetracted: false,
			audio: undefined,
			isUploading: false,

			// Basic setters
			setAudioFile: (audioFile) => set({ audioFile }),
			setIsDragging: (isDragging) => set({ isDragging }),
			setShowConfirmDialog: (showConfirmDialog) =>
				set({ showConfirmDialog }),
			setIsRetracted: (isRetracted) => set({ isRetracted }),
			setAudio: (audio) => {
				set({ audio });
				// Preload cover art when audio changes
				if (audio) {
					preloadImage(getCoverArtUrl(audio.id));
				}
			},
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
					audio: undefined,
					isUploading: false,
				});
			},
		}),
		{
			name: 'track-upload-store',
		}
	)
);

// Selector hooks for better performance
export const useTrackUploadAudio = () =>
	useTrackUploadStore((state) => state.audio);
export const useTrackUploadFile = () =>
	useTrackUploadStore((state) => state.audioFile);
export const useTrackUploadDragging = () =>
	useTrackUploadStore((state) => state.isDragging);
export const useTrackUploadRetracted = () =>
	useTrackUploadStore((state) => state.isRetracted);
export const useTrackUploadUploading = () =>
	useTrackUploadStore((state) => state.isUploading);
