import { useQuery } from '@tanstack/react-query';
import { getLyrics } from '../data/api';
import type { LyricLine } from '../data/types';

export type Lyrics = {
	id: string;
	createdAt: string;
	updatedAt: string;
	text: string;
	projectId: string;
	lines: LyricLine[];
};

export interface UseGetLyricsOptions {
	projectId: string;
	enabled?: boolean;
}

export function useGetLyrics({
	projectId,
	enabled = true,
}: UseGetLyricsOptions) {
	return useQuery({
		queryKey: ['lyrics', projectId],
		queryFn: () => getLyrics(projectId),
		enabled: enabled && !!projectId,
		retry: false,
		refetchOnWindowFocus: false,
	});
}
