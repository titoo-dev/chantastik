import { useMutation } from '@tanstack/react-query';
import { renderVideo } from '../data/api';

export interface RenderVideoParams {
	compositionId: string;
	inputProps?: Record<string, any>;
	outputFileName?: string;
	totalFrames?: number;
}

export interface RenderVideoResult {
	success: boolean;
	message: string;
	fileName: string;
	downloadUrl: string;
}

export const useRenderVideo = () => {
	return useMutation<RenderVideoResult, Error, RenderVideoParams>({
		mutationFn: renderVideo,
		onSuccess: (data) => {
			console.log('Video render completed:', data.fileName);
		},
		onError: (error) => {
			console.error('Video render failed:', error.message);
		},
	});
};
