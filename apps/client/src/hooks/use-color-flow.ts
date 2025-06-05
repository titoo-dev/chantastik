import { useEffect, useState } from 'react';
import { getCoverArtUrl } from '@/data/api';

import materialDynamicColors from 'material-dynamic-colors';
import { useTrackUploadStore } from '@/stores/track-upload/store';

type MDC = Awaited<ReturnType<typeof materialDynamicColors>>;

export const useColorFlow = () => {
	const [theme, setTheme] = useState<MDC | null>();
	const audio = useTrackUploadStore((state) => state.audio);

	useEffect(() => {
		if (!audio) return;
		const src = getCoverArtUrl(audio.id);

		materialDynamicColors(src).then((mdc) => setTheme(mdc));
	}, [audio?.id]);

	return theme;
};
