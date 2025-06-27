import { Music, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
	onAddLine: () => void;
};

export function EmptyLyrics({ onAddLine }: Props) {
	return (
		<div
			className="flex flex-col items-center justify-center p-12 text-center m-6 rounded-lg border border-dashed bg-muted/30 backdrop-blur-sm"
			data-testid="empty-lyrics-container"
		>
			<div
				className="rounded-full bg-primary/10 p-4 mb-4"
				data-testid="empty-lyrics-icon-wrapper"
			>
				<Music
					className="h-10 w-10 text-primary"
					data-testid="empty-lyrics-music-icon"
				/>
			</div>
			<h3
				className="text-lg font-medium mb-2"
				data-testid="empty-lyrics-title"
			>
				No lyrics yet
			</h3>
			<p
				className="text-muted-foreground mb-6 max-w-md"
				data-testid="empty-lyrics-description"
			>
				Add your first lyric line to start creating your masterpiece
			</p>
			<Button
				onClick={onAddLine}
				className="gap-2"
				data-testid="add-first-line-button"
				type="button"
				aria-label="Add your first lyric line to begin creating lyrics"
			>
				<PlusCircle
					className="h-4 w-4"
					data-testid="add-first-line-icon"
					aria-hidden="true"
				/>{' '}
				Add First Line
			</Button>
		</div>
	);
}
