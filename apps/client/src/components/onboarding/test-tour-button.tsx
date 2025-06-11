import { useOnboarding } from '@/hooks/use-onboarding';

export const TestTourButton = () => {
	const { startOnboarding, resetOnboarding, run, hasCompletedOnboarding } =
		useOnboarding();

	return (
		<div className="fixed top-4 left-4 bg-background border rounded p-4 z-50 space-y-2">
			<h3 className="font-semibold">Tour Test</h3>
			<div className="text-xs">
				<div>Run: {run ? 'YES' : 'NO'}</div>
				<div>Completed: {hasCompletedOnboarding ? 'YES' : 'NO'}</div>
			</div>
			<button
				onClick={() => {
					console.log('Manual start clicked');
					startOnboarding();
				}}
				className="block w-full px-3 py-2 bg-blue-500 text-white rounded text-sm"
			>
				Start Tour
			</button>
			<button
				onClick={() => {
					console.log('Reset clicked');
					resetOnboarding();
				}}
				className="block w-full px-3 py-2 bg-red-500 text-white rounded text-sm"
			>
				Reset & Auto-Start
			</button>
		</div>
	);
};
