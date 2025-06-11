import { useQuery } from '@tanstack/react-query';
import { getAudioMetadata } from '@/data/api';
import { useEffect } from 'react';

export function useGetAudio(
	audioId: string | undefined,
	onSuccess?: (data: any) => void
) {
	const query = useQuery({
		queryKey: ['audioMetadata', audioId],
		queryFn: () => getAudioMetadata(audioId || ''),
		enabled: !!audioId,
		retry: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (query.isSuccess && query.data) {
			// Store audio metadata to localStorage
			localStorage.setItem(
				'currentAudioMetadata',
				JSON.stringify(query.data)
			);

			onSuccess?.(query.data);
		}
	}, [query.isSuccess]);

	return query;
}
