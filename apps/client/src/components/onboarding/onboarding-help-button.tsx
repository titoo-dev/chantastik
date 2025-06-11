import { HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOnboarding } from '@/hooks/use-onboarding';

export const OnboardingHelpButton = () => {
	const { startOnboarding, resetOnboarding, hasCompletedOnboarding } =
		useOnboarding();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="h-9 w-9"
					title="Help & Onboarding"
				>
					<HelpCircle className="h-4 w-4" />
					<span className="sr-only">Help & Onboarding</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem
					onClick={startOnboarding}
					className="cursor-pointer gap-2"
				>
					<HelpCircle className="h-4 w-4" />
					{hasCompletedOnboarding ? 'Restart Tour' : 'Start Tour'}
				</DropdownMenuItem>
				{hasCompletedOnboarding && (
					<DropdownMenuItem
						onClick={resetOnboarding}
						className="cursor-pointer gap-2 text-muted-foreground"
					>
						<RotateCcw className="h-4 w-4" />
						Reset Tour Progress
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
