import { useMutation } from '@tanstack/react-query';
import { renderVideo } from '../data/api';

export type RenderVideoParams = {
	compositionId: string;
	inputProps?: Record<string, any>;
	outputFileName?: string;
	totalFrames?: number;
};

export type RenderVideoResult = {
	success: boolean;
	message: string;
	fileName: string;
	downloadUrl: string;
};

export const useRenderVideo = () => {
	return useMutation<RenderVideoResult, Error, RenderVideoParams>({
		mutationFn: renderVideo,
	});
};
