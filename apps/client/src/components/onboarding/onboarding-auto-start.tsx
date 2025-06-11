import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';

export const OnboardingAutoStart = () => {
	const { hasCompletedOnboarding, startOnboarding } = useOnboarding();
	useEffect(() => {
		// Auto-start onboarding for new users after a short delay
		const timer = setTimeout(() => {
			if (!hasCompletedOnboarding) {
				startOnboarding();
			}
		}, 3000); // 3 second delay to let the app load

		return () => clearTimeout(timer);
	}, [hasCompletedOnboarding, startOnboarding]);

	return null; // This component doesn't render anything
};
