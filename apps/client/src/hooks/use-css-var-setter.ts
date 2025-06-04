import { useCallback, useRef } from 'react';

export const useCssVarSetter = () => {
	const styleElementRef = useRef<HTMLStyleElement | null>(null);

	if (typeof window !== 'undefined' && !styleElementRef.current) {
		const styleElement = document.createElement('style');
		styleElement.setAttribute('id', 'theme-variables');
		document.head.appendChild(styleElement);
		styleElementRef.current = styleElement;
	}

	// code bellow is 100% AI generated
	return useCallback((vars: Record<string, string>) => {
		if (!styleElementRef.current) return;

		requestAnimationFrame(() => {
			let cssText = ':root {';
			Object.entries(vars).forEach(([key, value]) => {
				cssText += `${key}: ${value};`;
			});
			cssText += '}';

			styleElementRef.current!.textContent = cssText;
		});
	}, []);
};
