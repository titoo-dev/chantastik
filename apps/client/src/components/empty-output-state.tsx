import { Music2 } from 'lucide-react';

export function EmptyOutputState() {
	return (
		<div className="flex h-[300px] flex-col items-center justify-center rounded-lg bg-muted/40 p-10">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
				<Music2 className="h-10 w-10 text-accent/80" />
			</div>
			<p className="mt-4 text-sm font-medium text-foreground">
				No audio processed yet
			</p>
			<p className="mt-1 text-xs text-center text-muted-foreground">
				Upload an audio file and click "Separate Vocals" to get started
			</p>
		</div>
	);
}
