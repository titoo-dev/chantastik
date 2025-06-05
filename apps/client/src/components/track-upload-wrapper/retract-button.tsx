import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { MoveDiagonal, Music } from 'lucide-react';

interface RetractButtonProps {
	isRetracted: boolean;
	hasAudio: boolean;
	onToggle: () => void;
}

export function RetractButton({
	isRetracted,
	hasAudio,
	onToggle,
}: RetractButtonProps) {
	return (
		<Button
			variant="outline"
			onClick={onToggle}
			className={cn(
				'fixed inset-x-0 bottom-6 mx-auto flex items-center gap-3 px-6 h-12 rounded-full',
				'border-2 border-dotted border-primary/50 bg-background/80 backdrop-blur-sm',
				'shadow-sm hover:shadow-primary/20 hover:border-primary transition-all duration-300',
				'group max-w-xs',
				isRetracted ? 'opacity-100' : 'opacity-0 pointer-events-none'
			)}
			title={hasAudio ? 'Expand audio player' : 'Expand audio uploader'}
		>
			<span className="relative flex items-center justify-center w-6 h-6">
				{hasAudio ? (
					<Music className="h-5 w-5 text-primary" />
				) : (
					<MoveDiagonal className="h-5 w-5 text-primary" />
				)}
			</span>
			<span className="font-medium text-sm">
				{hasAudio ? 'Show Player' : 'Upload Track'}
			</span>
		</Button>
	);
}
