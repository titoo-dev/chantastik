import { useQuery } from '@tanstack/react-query';
import { getAllProjects } from '../data/api';

export function useGetProjects({ enabled = true }: { enabled: boolean }) {
	return useQuery({
		queryKey: ['projects'],
		queryFn: getAllProjects,
		enabled,
		refetchOnWindowFocus: false,
	});
}
