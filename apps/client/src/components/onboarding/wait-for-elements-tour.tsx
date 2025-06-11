import { useState, useEffect } from 'react';
import Joyride, { STATUS, EVENTS } from 'react-joyride';

const waitForSteps = [
	{
		target: 'body',
		content: 'Welcome! This tour waits for elements to be available.',
		placement: 'center' as const,
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="upload-section"]',
		content: 'Upload section found!',
	},
];

export const WaitForElementsTour = () => {
	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);
	const [elementsReady, setElementsReady] = useState(false);

	// Check if elements are available
	useEffect(() => {
		const checkElements = () => {
			const uploadSection = document.querySelector(
				'[data-onboarding="upload-section"]'
			);
			console.log('Checking for upload section:', uploadSection);

			if (uploadSection) {
				console.log('Upload section found! Elements are ready.');
				setElementsReady(true);
				return true;
			}
			return false;
		};

		// Check immediately
		if (checkElements()) return;

		// If not found, check periodically
		const interval = setInterval(() => {
			if (checkElements()) {
				clearInterval(interval);
			}
		}, 500);

		return () => clearInterval(interval);
	}, []);

	// Start tour when elements are ready
	useEffect(() => {
		if (elementsReady) {
			console.log('Elements ready, starting tour in 1 second...');
			const timer = setTimeout(() => {
				setRun(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [elementsReady]);

	const handleJoyrideCallback = (data: any) => {
		const { status, type, index } = data;
		console.log('Wait tour callback:', { status, type, index });

		if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
			setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
		}

		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
			setRun(false);
		}
	};

	return (
		<Joyride
			steps={waitForSteps}
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
