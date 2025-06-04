import { useMutation } from '@tanstack/react-query';
import { uploadAudioFile, notifications } from '@/data/api';
import { useAppContext } from '@/hooks/use-app-context';

interface UseFileUploadOptions {
	onSuccess?: (data: any) => void;
	onError?: (error: Error) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
	const { updateAudioId, updateProjectId } = useAppContext();

	const uploadMutation = useMutation({
		mutationFn: uploadAudioFile,
		onSuccess: (data) => {
			notifications.uploadSuccess(data.message);
			updateAudioId(data.id);
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
