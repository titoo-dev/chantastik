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
			console.log('Auto-starting basic tour...');
			setRun(true);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handleJoyrideCallback = (data: any) => {
		const { status, type, index } = data;
		console.log('Basic tour callback:', { status, type, index });

		if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
			setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
		}

		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
			setRun(false);
		}
	};

	return (
		<>
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

			{/* Manual control buttons */}
			<div className="fixed top-40 left-4 bg-purple-500 text-white border rounded p-4 z-50 space-y-2">
				<h3 className="font-semibold">Basic Tour Control</h3>
				<div className="text-xs">
					<div>Run: {run ? 'YES' : 'NO'}</div>
					<div>Step: {stepIndex}</div>
				</div>
				<button
					onClick={() => {
						console.log('Manually starting basic tour');
						setRun(true);
						setStepIndex(0);
					}}
					className="block w-full px-3 py-2 bg-white text-purple-500 rounded text-sm"
				>
					Start Basic Tour
				</button>
				<button
					onClick={() => {
						console.log('Stopping basic tour');
						setRun(false);
					}}
					className="block w-full px-3 py-2 bg-red-500 text-white rounded text-sm"
				>
					Stop Tour
				</button>
			</div>
		</>
	);
};
