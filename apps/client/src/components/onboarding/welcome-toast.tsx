import { useEffect } from 'react';
import { toast } from 'sonner';
import { useOnboarding } from '@/hooks/use-onboarding';

export const WelcomeToast = () => {
	const { hasCompletedOnboarding, startOnboarding } = useOnboarding();

	useEffect(() => {
		if (!hasCompletedOnboarding) {
			// Show welcome toast for new users
			const timer = setTimeout(() => {
				toast('Welcome to Karaoke Milay! 🎤', {
					description:
						'Would you like to take a quick tour to get started?',
					action: {
						label: 'Start Tour',
						onClick: () => startOnboarding(),
					},
					duration: 8000,
				});
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [hasCompletedOnboarding, startOnboarding]);

	return null;
};
