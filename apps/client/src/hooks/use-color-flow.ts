import { useEffect, useState } from 'react';
import { useAppContext } from './use-app-context';
import { getCoverArtUrl } from '@/data/api';

import materialDynamicColors from 'material-dynamic-colors';

type MDC = Awaited<ReturnType<typeof materialDynamicColors>>;

export const useColorFlow = () => {
	const [theme, setTheme] = useState<MDC | null>();
	const { audioId } = useAppContext();

	useEffect(() => {
		if (!audioId) return;
		const src = getCoverArtUrl(audioId);

		materialDynamicColors(src).then((mdc) => setTheme(mdc));
	}, [audioId]);

	return theme;
};
