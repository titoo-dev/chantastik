import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

export function ThemeModeToggle() {
	const { setTheme } = useTheme();

	return (
		<div className="relative inline-block">
			<button
				className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				onClick={() => {
					// Simple toggle between light and dark
					const currentTheme =
						document.documentElement.classList.contains('dark')
							? 'dark'
							: 'light';
					setTheme(currentTheme === 'light' ? 'dark' : 'light');
				}}
			>
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute top-2 left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</button>
		</div>
	);
}
