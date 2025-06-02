import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/app-context';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<AppProvider>
			<Header />
			<>
				<Outlet />
				<Toaster />
			</>
		</AppProvider>
	),
});
