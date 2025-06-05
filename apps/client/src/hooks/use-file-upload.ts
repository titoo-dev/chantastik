import { useMutation } from '@tanstack/react-query';
import { uploadAudioFile, notifications } from '@/data/api';
import { useAppStore } from '@/stores/app/store';
import { useTrackUploadStore } from '@/stores/track-upload/store';

interface UseFileUploadOptions {
	onSuccess?: (data: any) => void;
	onError?: (error: Error) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
	const { updateProjectId } = useAppStore.getState();
	const { setAudio } = useTrackUploadStore.getState();

	const uploadMutation = useMutation({
		mutationFn: uploadAudioFile,
		onSuccess: (data) => {
			notifications.uploadSuccess(data.message);
			setAudio(data.audioMetadata);
			updateProjectId(data.projectId);
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			notifications.uploadError(error as Error);
			options?.onError?.(error as Error);
		},
		retry: false,
	});

	return {
		uploadFile: uploadMutation.mutate,
		isUploading: uploadMutation.isPending,
		uploadError: uploadMutation.error,
		reset: uploadMutation.reset,
	};
}
