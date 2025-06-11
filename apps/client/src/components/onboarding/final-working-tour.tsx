import { useState, useEffect, useCallback } from 'react';
import Joyride, { STATUS, EVENTS, type CallBackProps } from 'react-joyride';

const finalSteps = [
	{
		target: 'body',
		content: (
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-2">
					Welcome to Karaoke Milay! 🎤
				</h2>
				<p className="text-gray-600 mb-4">
					Let's take a quick tour to help you create amazing karaoke
					videos.
				</p>
				<p className="text-sm text-gray-500">
					This walkthrough will show you the main features in just a
					few steps.
				</p>
			</div>
		),
		placement: 'center' as const,
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="upload-section"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold mb-2">
					📂 Step 1: Upload Your Audio
				</h3>
				<p className="text-gray-600 mb-3">
					Start by uploading an audio file or drag & drop it here.
					Supported formats include MP3, WAV, and more.
				</p>
			</div>
		),
		placement: 'top' as const,
		disableBeacon: true,
	},
	{
		target: '[data-onboarding="lyric-editor"]',
		content: (
			<div>
				<h3 className="text-lg font-semibold mb-2">
					✏️ Step 2: Create Your Lyrics
				</h3>
				<p className="text-gray-600 mb-3">
					Add lyrics line by line here. Each line can have its own
					timestamp for perfect synchronization.
				</p>
			</div>
		),
		placement: 'right' as const,
		disableBeacon: true,
	},
];

export const FinalWorkingTour = () => {
	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);
	const [, setElementsReady] = useState(false);

	// Check for elements and auto-start
	useEffect(() => {
		let checkCount = 0;
		const maxChecks = 10;

		const checkForElements = () => {
			checkCount++;
			const uploadSection = document.querySelector(
				'[data-onboarding="upload-section"]'
			);

			if (uploadSection) {
				setElementsReady(true);

				// Auto-start tour after elements are ready
				setTimeout(() => {
					setRun(true);
				}, 1000);

				return true;
			}

			if (checkCount < maxChecks) {
				setTimeout(checkForElements, 1000);
			} else {
			}

			return false;
		};

		// Start checking after a short delay
		setTimeout(checkForElements, 500);
	}, []);

	const handleJoyrideCallback = useCallback((data: CallBackProps) => {
		const { status, type, index } = data;

		if (
			[EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)
		) {
			const nextIndex = index + (type === EVENTS.STEP_AFTER ? 1 : 0);
			setStepIndex(nextIndex);
		}

		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
			setRun(false);
		}
	}, []);

	return (
		<Joyride
			steps={finalSteps}
			run={run}
			stepIndex={stepIndex}
			callback={handleJoyrideCallback}
			continuous={true}
			showSkipButton={true}
			showProgress={true}
			debug={false}
			disableOverlayClose={true}
			spotlightClicks={true}
			styles={{
				options: {
					zIndex: 10000,
					primaryColor: '#3b82f6',
				},
				overlay: {
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
				},
				spotlight: {
					borderRadius: '8px',
				},
			}}
			floaterProps={{
				disableAnimation: false,
			}}
		/>
	);
};
