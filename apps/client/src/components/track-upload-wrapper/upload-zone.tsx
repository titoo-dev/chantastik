import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { Button } from '../ui/button';

interface UploadZoneProps {
	isDragging: boolean;
	isUploading: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onBrowseClick: () => void;
	dragHandlers: Record<string, (e: any) => void>;
}

export function UploadZone({
	isDragging,
	isUploading,
	fileInputRef,
	onInputChange,
	onBrowseClick,
	dragHandlers,
}: UploadZoneProps) {
	return (
		<div
			className={cn(
				'w-full max-w-xl mx-auto p-6 rounded-xl transition-all duration-200',
				'border-2 border-dashed flex flex-col items-center justify-center',
				'bg-card',
				isDragging
					? 'border-primary border-opacity-70 bg-muted/30'
					: 'border-muted-foreground/20'
			)}
			{...dragHandlers}
		>
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
				<Upload className="h-8 w-8 text-primary" />
			</div>
			<h3 className="text-lg font-medium mb-2">Add your track</h3>
			<p className="text-sm text-muted-foreground text-center mb-4">
				Drag and drop an audio file or browse to upload
			</p>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="audio/*"
				onChange={onInputChange}
				disabled={isUploading}
			/>
			<Button
				variant="outline"
				className="mt-2"
				onClick={onBrowseClick}
				disabled={isUploading}
			>
				Browse Files
			</Button>
			<p className="text-xs text-muted-foreground mt-4">
				Supports MP3, WAV, OGG, FLAC
			</p>
		</div>
	);
}
