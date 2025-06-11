import { useEffect, useState } from 'react';
import { getCoverArtUrl } from '@/data/api';

import materialDynamicColors from 'material-dynamic-colors';
import { useAppStore } from '@/stores/app/store';

type MDC = Awaited<ReturnType<typeof materialDynamicColors>>;

export const useColorFlow = () => {
	const [theme, setTheme] = useState<MDC | null>();
	const audio = useAppStore((state) => state.audio);

	useEffect(() => {
		if (!audio) return;
		const src = getCoverArtUrl(audio.id);

		materialDynamicColors(src).then((mdc) => setTheme(mdc));
	}, [audio?.id]);

	return theme;
};
