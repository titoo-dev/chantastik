import { useEffect, useState } from 'react';
import { useAppContext } from './use-app-context';
import { getCoverArtUrl } from '@/data/api';

import materialDynamicColors from 'material-dynamic-colors';

type MDC = Awaited<ReturnType<typeof materialDynamicColors>>;

export const useColorFlow = () => {
	const [theme, setTheme] = useState<MDC | null>();
	const { audio } = useAppContext();

	useEffect(() => {
		if (!audio) return;
		const src = getCoverArtUrl(audio.id);

		materialDynamicColors(src).then((mdc) => setTheme(mdc));
	}, [audio?.id]);

	return theme;
};
