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
			return stored === 'true';
		} catch (error) {
			console.error('Error reading localStorage:', error);
			return false;
		}
	});
	const startOnboarding = useCallback(() => {
		setRun(true);
		setStepIndex(0);
	}, []);

	const stopOnboarding = useCallback(() => {
		setRun(false);
		setStepIndex(0);
	}, []);
	const completeOnboarding = useCallback(() => {
		setRun(false);
		setHasCompletedOnboarding(true);
		try {
			localStorage.setItem('karaoke-onboarding-completed', 'true');
		} catch (error) {
			console.error('Error saving to localStorage:', error);
		}
	}, []);

	const resetOnboarding = useCallback(() => {
		try {
			localStorage.removeItem('karaoke-onboarding-completed');
		} catch (error) {
			console.error('Error removing from localStorage:', error);
		}
		setHasCompletedOnboarding(false);
		setRun(false);
		setStepIndex(0);
	}, []);
	const handleJoyrideCallback = useCallback(
		(data: CallBackProps) => {
			const { status, type, index } = data;

			if (
				[EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(
					type as any
				)
			) {
				setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
			}

			if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
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
