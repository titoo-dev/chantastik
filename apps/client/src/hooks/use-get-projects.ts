import { useQuery } from '@tanstack/react-query';
import { getAllProjects } from '../data/api';

export function useGetProjects(enabled = true) {
	return useQuery({
		queryKey: ['projects'],
		queryFn: getAllProjects,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		enabled,
	});
}
