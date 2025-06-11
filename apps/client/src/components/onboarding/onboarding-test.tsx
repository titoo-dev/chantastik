import Joyride from 'react-joyride';
import { useOnboarding } from '@/hooks/use-onboarding';

const testSteps = [
	{
		target: 'body',
		content: 'This is a test step to see if Joyride is working!',
		placement: 'center' as const,
		disableBeacon: true,
	},
];

export const OnboardingTest = () => {
	const { run, startOnboarding } = useOnboarding();

	return (
		<>
			<Joyride
				steps={testSteps}
				run={run}
				continuous={true}
				showSkipButton={true}
				showProgress={false}
				styles={{
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.4)',
					},
				}}
			/>
			<div className="fixed top-4 right-4 z-50">
				<button
					onClick={startOnboarding}
					className="px-4 py-2 bg-primary text-primary-foreground rounded"
				>
					Test Tour
				</button>
			</div>
		</>
	);
};
