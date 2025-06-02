import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '../data/api';

export function useDeleteProject({ onSuccess }: { onSuccess?: () => void }) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ['deleteProject'],
		mutationFn: deleteProject,
		gcTime: 0,
		retry: false,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			if (onSuccess) {
				onSuccess();
			}
		},
	});
}
