import { Minimize2, X } from 'lucide-react';
import { Button } from '../ui/button';

type ControlButtonsProps = {
	onRetract: () => void;
	onRemove: () => void;
	isUploading: boolean;
};

export function ControlButtons({
	onRetract,
	onRemove,
	isUploading,
}: ControlButtonsProps) {
	return (
		<div className="absolute right-4 top-4 z-10 flex gap-2">
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 rounded-full bg-transparent hover:bg-muted focus-visible:outline-1"
				onClick={onRetract}
				title="Retract player"
			>
				<Minimize2 className="h-4 w-4 text-muted-foreground rotate-180" />
			</Button>
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 rounded-full bg-transparent focus-visible:outline-1"
				onClick={onRemove}
				title="Remove audio"
				disabled={isUploading}
			>
				<X className="h-4 w-4 text-muted-foreground" />
			</Button>
		</div>
	);
}
