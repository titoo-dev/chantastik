import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';
import { WithColorFlow } from '@/components/with-color-flow';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<AppProvider>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<WithColorFlow>
					<main className="antialiased">
						<Header />
						<>
							<Outlet />
							<Toaster />
						</>
					</main>
				</WithColorFlow>
			</ThemeProvider>
		</AppProvider>
	),
});
