import { useEffect } from 'react';
import Joyride from 'react-joyride';
import { useOnboarding } from '@/hooks/use-onboarding';
import { onboardingSteps } from './onboarding-steps';
import './onboarding.css';

interface OnboardingTooltipProps {
	index: number;
	step: any;
	backProps: any;
	closeProps: any;
	primaryProps: any;
	skipProps: any;
	tooltipProps: any;
	isLastStep: boolean;
}

export const OnboardingTooltip = ({
	index,
	step,
	backProps,
	closeProps,
	primaryProps,
	skipProps,
	tooltipProps,
	isLastStep,
}: OnboardingTooltipProps) => {
	return (
		<div
			{...tooltipProps}
			className="bg-background border border-border rounded-lg shadow-xl max-w-md onboarding-content"
		>
			{/* Progress indicator */}
			<div className="flex items-center gap-2 px-4 pt-4 pb-2">
				<div className="flex gap-1">
					{onboardingSteps.map((_, i) => (
						<div
							key={i}
							className={`h-1.5 w-6 rounded-full onboarding-progress-bar ${
								i <= index
									? i === index
										? 'bg-primary active'
										: 'bg-primary'
									: 'bg-muted'
							}`}
						/>
					))}
				</div>
				<span className="text-xs font-medium text-muted-foreground ml-auto">
					{index + 1} / {onboardingSteps.length}
				</span>
			</div>

			{/* Content */}
			<div className="px-4 pb-4">{step.content}</div>

			{/* Actions */}
			<div className="flex items-center justify-between gap-3 px-4 pb-4 pt-2 border-t border-border">
				<div className="flex gap-2">
					{index > 0 && (
						<button
							{...backProps}
							className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted onboarding-button"
						>
							Back
						</button>
					)}
					<button
						{...skipProps}
						className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted onboarding-button"
					>
						Skip Tour
					</button>
				</div>

				<button
					{...primaryProps}
					className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm onboarding-button"
				>
					{isLastStep ? '🎉 Finish' : 'Next →'}
				</button>
			</div>

			{/* Close button */}
			<button
				{...closeProps}
				className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors onboarding-button"
				aria-label="Close"
			>
				<svg
					className="w-4 h-4 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	);
};

export const OnboardingTour = () => {
	const { run, stepIndex, handleJoyrideCallback } = useOnboarding();

	console.log('OnboardingTour render:', {
		run,
		stepIndex,
		stepsLength: onboardingSteps.length,
	});

	// Debug: check if target elements exist
	useEffect(() => {
		if (run) {
			console.log('Tour is running, checking target elements...');
			onboardingSteps.forEach((step, index) => {
				const element = document.querySelector(step.target);
				console.log(
					`Step ${index + 1} target "${step.target}":`,
					element ? 'FOUND' : 'NOT FOUND',
					element
				);
			});
		}
	}, [run]);
	return (
		<Joyride
			steps={onboardingSteps}
			run={run}
			stepIndex={stepIndex}
			callback={handleJoyrideCallback}
			continuous={true}
			showProgress={false}
			showSkipButton={true}
			spotlightClicks={true}
			disableOverlayClose={false}
			debug={true}
			styles={{
				options: {
					zIndex: 10000,
				},
				overlay: {
					backgroundColor: 'rgba(0, 0, 0, 0.4)',
				},
				spotlight: {
					borderRadius: '8px',
					border: '2px solid hsl(var(--primary))',
					boxShadow:
						'0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 20px hsl(var(--primary))',
				},
			}}
			locale={{
				back: 'Back',
				close: 'Close',
				last: 'Finish',
				next: 'Next',
				skip: 'Skip Tour',
			}}
		/>
	);
};
