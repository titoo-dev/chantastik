import { useColorFlow } from '@/hooks/use-color-flow';
import { useCssVarSetter } from '@/hooks/use-css-var-setter';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useTheme } from '@/hooks/use-theme';
import Color from 'color';
import { type ReactNode, useEffect, useMemo } from 'react';

type ColorMode = 'light' | 'dark';

export function WithColorFlow({ children }: { children: ReactNode }) {
	const mdc = useColorFlow();
	const { theme } = useTheme();
	const systemTheme = useSystemTheme();
	const setCssVars = useCssVarSetter();

	const mode: ColorMode = theme === 'system' ? systemTheme : theme;

	const cssVars = useMemo(() => {
		if (!mdc || !mdc[mode]) return {};

		const colors = mdc[mode];
		const borderValue = Color(colors.onBackground)
			.alpha(0.1)
			.hsl()
			.string();

		return {
			// Core theme variables
			'--background': colors.surface,
			'--foreground': colors.onBackground,
			'--card': colors.surface,
			'--card-foreground': colors.onBackground,
			'--popover': colors.background,
			'--popover-foreground': colors.onBackground,
			'--primary': colors.primary,
			'--primary-foreground': colors.onPrimary,
			'--secondary': colors.secondary,
			'--secondary-foreground': colors.onSecondary,
			'--muted': Color(colors.onBackground).alpha(0.05).hsl().string(),
			'--muted-foreground': Color(colors.onBackground)
				.alpha(0.6)
				.hsl()
				.string(),
			'--accent': Color(colors.primary).alpha(0.1).hsl().string(),
			'--accent-foreground': colors.onBackground,
			'--destructive': colors.error,
			'--destructive-foreground': colors.onError,
			'--border': borderValue,
			'--input': borderValue,
			'--ring': Color(colors.primary).alpha(0.3).hsl().string(),

			// Chart colors
			'--chart-1': Color(colors.primary).rotate(0).hsl().string(),
			'--chart-2': Color(colors.primary).rotate(60).hsl().string(),
			'--chart-3': Color(colors.primary).rotate(120).hsl().string(),
			'--chart-4': Color(colors.primary).rotate(180).hsl().string(),
			'--chart-5': Color(colors.primary).rotate(240).hsl().string(),

			// Sidebar variables
			'--sidebar': colors.surface,
			'--sidebar-foreground': colors.onBackground,
			'--sidebar-primary': colors.primary,
			'--sidebar-primary-foreground': colors.onPrimary,
			'--sidebar-accent': Color(colors.primary).alpha(0.1).hsl().string(),
			'--sidebar-accent-foreground': colors.onBackground,
			'--sidebar-border': borderValue,
			'--sidebar-ring': Color(colors.primary).alpha(0.3).hsl().string(),

			// Font families
			'--font-sans':
				'Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
			'--font-serif':
				'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
			'--font-mono':
				'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

			// Border radius
			'--radius': '0.625rem',

			// Shadow variables
			'--shadow-2xs': '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
			'--shadow-xs': '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
			'--shadow-sm':
				'0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
			'--shadow':
				'0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
			'--shadow-md':
				'0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
			'--shadow-lg':
				'0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)',
			'--shadow-xl':
				'0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)',
			'--shadow-2xl': '0 1px 3px 0px hsl(0 0% 0% / 0.25)',

			// Legacy variables for backward compatibility
			'--color-foreground': colors.onBackground,
			'--primary-container': colors.primaryContainer,
		};
	}, [mdc, mode]);

	useEffect(() => {
		if (Object.keys(cssVars).length > 0) {
			setCssVars(cssVars as Record<string, string>);
		}
	}, [cssVars, setCssVars]);

	return <>{children}</>;
}
