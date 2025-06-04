import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LyricLine } from '@/components/lyric-studio/lyric-line-item';
import { updateProject, type Project } from '@/data/api';

type UpdateProjectVariables = {
	id: string;
	updates: {
		text: string;
		lines: LyricLine[];
	};
};

export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }: UpdateProjectVariables) =>
			updateProject(id, updates),

		onSuccess: (updatedProject: Project) => {
			// Invalidate and refetch projects list
			queryClient.invalidateQueries({ queryKey: ['projects'] });

			// Update the specific project in cache
			queryClient.setQueryData(
				['project', updatedProject.id],
				updatedProject
			);
		},

		onError: (error) => {
			console.error('Project update failed:', error);
		},
	});
}
