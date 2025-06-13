import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveLyrics } from '@/data/api';
import type { LyricLine } from '@/data/types';

type SaveLyricsParams = {
	projectId: string;
	text: string;
	lines: LyricLine[];
};

type SaveLyricsResponse = {
	lyricsId: string;
	projectId: string;
};

export const useSaveLyrics = () => {
	const queryClient = useQueryClient();

	return useMutation<SaveLyricsResponse, Error, SaveLyricsParams>({
		mutationFn: async ({ projectId, text, lines }) => {
			return await saveLyrics(projectId, { text, lines });
		},
		onSuccess: (data, variables) => {
			// Invalidate and refetch project data
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectId],
			});

			// Invalidate projects list
			queryClient.invalidateQueries({
				queryKey: ['projects'],
			});

			// Cache the lyrics data
			queryClient.setQueryData(['lyrics', variables.projectId], {
				id: data.lyricsId,
				projectId: data.projectId,
				text: variables.text,
				lines: variables.lines,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		},
		onError: (error) => {
			console.error('Failed to save lyrics:', error);
		},
	});
};
