import { useState, useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';

const basicSteps = [
	{
		target: 'body',
		content: 'Welcome to Karaoke Milay! This is a basic onboarding tour.',
		placement: 'center' as const,
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="upload-section"]',
		content: 'Here you can upload your audio files.',
	},
	{
		target: '[data-onboarding="lyric-editor"]',
		content: 'This is where you create and edit lyrics.',
	},
];

export const BasicOnboardingTour = () => {
	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);

	// Auto-start after a delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setRun(true);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handleJoyrideCallback = (data: any) => {
		const { status, type, index } = data;

		if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
			setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
		}

		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
			setRun(false);
		}
	};

	return (
		<Joyride
			steps={basicSteps}
			run={run}
			stepIndex={stepIndex}
			callback={handleJoyrideCallback}
			continuous={true}
			showSkipButton={true}
			debug={true}
			styles={{
				options: {
					zIndex: 10000,
				},
			}}
		/>
	);
};
