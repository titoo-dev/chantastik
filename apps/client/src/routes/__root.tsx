import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/theme-context';
import { WithColorFlow } from '@/components/with-color-flow';
import { AudioRefProvider } from '@/context/audio-ref-context';
import { VideoRefProvider } from '@/context/video-ref-context';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<AudioRefProvider>
			<VideoRefProvider>
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
			</VideoRefProvider>
		</AudioRefProvider>
	),
});
