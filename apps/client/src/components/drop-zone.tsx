import { cn } from '@/lib/utils';
import { Music, Upload } from 'lucide-react';

export function DropZone({
	file,
	handleFileChange,
}: {
	file: File | null;
	handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors',
				'bg-muted/40 hover:bg-muted/60',
				file ? 'border-primary/50' : 'border-border'
			)}
			onClick={() => document.getElementById('audio-file')?.click()}
		>
			<input
				type="file"
				id="audio-file"
				className="hidden"
				accept="audio/*"
				onChange={handleFileChange}
			/>
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
				{!file ? (
					<Upload className="h-10 w-10 text-primary/80" />
				) : (
					<Music className="h-10 w-10 text-primary/80" />
				)}
			</div>
			<p className="mt-4 text-sm font-medium text-foreground">
				{file ? file.name : 'Drag and drop or click to upload'}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">
				Supports MP3, WAV, OGG, FLAC
			</p>
		</div>
	);
}
