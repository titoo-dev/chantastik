/**
 * Thèmes de vidéo lyrique (compositions Remotion). Le domaine connaît
 * l'IDENTITÉ des thèmes et le format de sortie ; l'implémentation visuelle
 * (composants Remotion) vit côté adapter de rendu.
 */
export const THEME_IDS = [
	'minimal-zen',
	'retro-reel',
	'vibrant-memories',
	'embedded-lyrics',
	'bottom-right-lyrics',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const isThemeId = (value: string): value is ThemeId =>
	(THEME_IDS as readonly string[]).includes(value);

export type AspectRatio = 'horizontal' | 'vertical';

export const dimensionsFor = (
	ratio: AspectRatio
): { readonly width: number; readonly height: number } =>
	ratio === 'vertical'
		? { width: 1080, height: 1920 }
		: { width: 1920, height: 1080 };
