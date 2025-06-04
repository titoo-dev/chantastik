import { useMemo } from 'react';

export const useSystemTheme = () => {
	const darkModeMediaQuery = useMemo(
		() =>
			typeof window !== 'undefined'
				? window.matchMedia('(prefers-color-scheme: dark)')
				: null,
		[]
	);

	return useMemo(
		() => (darkModeMediaQuery?.matches ? 'dark' : 'light'),
		[darkModeMediaQuery?.matches]
	);
};
