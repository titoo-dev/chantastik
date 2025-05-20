import { Music, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyLyricsProps {
	onAddLine: () => void;
}

export function EmptyLyrics({ onAddLine }: EmptyLyricsProps) {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center m-6 rounded-lg border border-dashed bg-muted/30 backdrop-blur-sm">
			<div className="rounded-full bg-primary/10 p-4 mb-4">
				<Music className="h-10 w-10 text-primary" />
			</div>
			<h3 className="text-lg font-medium mb-2">No lyrics yet</h3>
			<p className="text-muted-foreground mb-6 max-w-md">
				Add your first lyric line to start creating your masterpiece
			</p>
			<Button onClick={onAddLine} className="gap-2">
				<PlusCircle className="h-4 w-4" /> Add First Line
			</Button>
		</div>
	);
}
