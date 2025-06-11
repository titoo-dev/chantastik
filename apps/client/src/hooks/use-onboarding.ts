import { useState, useCallback } from 'react';
import { STATUS, EVENTS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';

export interface OnboardingStep extends Step {
	target: string;
	content: React.ReactNode;
	title?: string;
	placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
	disableBeacon?: boolean;
	hideCloseButton?: boolean;
	hideFooter?: boolean;
	showProgress?: boolean;
	showSkipButton?: boolean;
}

export const useOnboarding = () => {
	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
		try {
			const stored = localStorage.getItem('karaoke-onboarding-completed');
			console.log('Reading localStorage onboarding status:', stored);
			return stored === 'true';
		} catch (error) {
			console.error('Error reading localStorage:', error);
			return false;
		}
	});
	const startOnboarding = useCallback(() => {
		console.log('Starting onboarding tour...');
		setRun(true);
		setStepIndex(0);
	}, []);

	const stopOnboarding = useCallback(() => {
		console.log('Stopping onboarding tour...');
		setRun(false);
		setStepIndex(0);
	}, []);
	const completeOnboarding = useCallback(() => {
		console.log('Completing onboarding...');
		setRun(false);
		setHasCompletedOnboarding(true);
		try {
			localStorage.setItem('karaoke-onboarding-completed', 'true');
			console.log('Saved completion status to localStorage');
		} catch (error) {
			console.error('Error saving to localStorage:', error);
		}
	}, []);

	const resetOnboarding = useCallback(() => {
		console.log('Resetting onboarding...');
		try {
			localStorage.removeItem('karaoke-onboarding-completed');
			console.log('Removed completion status from localStorage');
		} catch (error) {
			console.error('Error removing from localStorage:', error);
		}
		setHasCompletedOnboarding(false);
		setRun(false);
		setStepIndex(0);
	}, []);
	const handleJoyrideCallback = useCallback(
		(data: CallBackProps) => {
			const { status, type, index, action } = data;
			console.log('Joyride callback:', { status, type, index, action });

			if (
				[EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(
					type as any
				)
			) {
				console.log(
					'Moving to next step:',
					index + (type === EVENTS.STEP_AFTER ? 1 : 0)
				);
				setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
			}

			if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
				console.log('Tour finished or skipped');
				completeOnboarding();
			}
		},
		[completeOnboarding]
	);

	return {
		run,
		stepIndex,
		hasCompletedOnboarding,
		startOnboarding,
		stopOnboarding,
		completeOnboarding,
		resetOnboarding,
		handleJoyrideCallback,
	};
};
