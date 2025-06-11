import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/theme-context';
import { WithColorFlow } from '@/components/with-color-flow';
import { AudioRefProvider } from '@/context/audio-ref-context';
import { VideoRefProvider } from '@/context/video-ref-context';
import { Audio } from '@/components/audio';
import { OnboardingTour } from '@/components/onboarding/onboarding-tour';
import { OnboardingAutoStart } from '@/components/onboarding/onboarding-auto-start';
import { WelcomeToast } from '@/components/onboarding/welcome-toast';

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
							<Header />{' '}
							<>
								<Outlet />
								<Toaster />
								<Audio />
								<OnboardingTour />
								<OnboardingAutoStart />
								<WelcomeToast />
							</>
						</main>
					</WithColorFlow>
				</ThemeProvider>
			</VideoRefProvider>
		</AudioRefProvider>
	),
});
