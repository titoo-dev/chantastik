import { useState, useRef, useEffect, type ComponentRef } from 'react';
import { Music, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrackPlayer } from './track-player';
import { Button } from './ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog';
import { useAppContext } from '@/hooks/use-app-context';

interface TrackUploadWrapperProps {
	audioRef: React.RefObject<ComponentRef<'audio'> | null>;
	iconColor?: string;
	showDownload?: boolean;
}

export function TrackUploadWrapper({
	audioRef,
	iconColor = 'text-primary',
	showDownload = false,
}: TrackUploadWrapperProps) {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isRetracted, setIsRetracted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setTrackLoaded } = useAppContext();

	// Clean up object URL on unmount
	useEffect(() => {
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
		};
	}, [audioUrl]);

	const handleFileChange = (file: File) => {
		// Revoke previous URL if it exists
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}

		setAudioFile(file);
		const url = URL.createObjectURL(file);
		setAudioUrl(url);

		setTrackLoaded(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileChange(file);
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) {
			setIsDragging(true);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file && file.type.startsWith('audio/')) {
			handleFileChange(file);
		}
	};

	const handleRemoveAudio = () => {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		setAudioFile(null);
		setAudioUrl(null);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
		}

		// Call the onAudioRemove callback if provided
		setTrackLoaded(false);
	};

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	const toggleRetracted = () => {
		setIsRetracted(!isRetracted);
	};

	// Retracted state for both the uploader and player
	if (isRetracted) {
		return (
			<Button
				size="icon"
				variant="secondary"
				onClick={toggleRetracted}
				className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
				title={
					audioFile ? 'Expand audio player' : 'Expand audio uploader'
				}
			>
				{audioFile ? (
					<Music className="h-6 w-6 text-primary" />
				) : (
					<Upload className="h-6 w-6 text-primary" />
				)}
			</Button>
		);
	}

	// Upload state
	if (!audioFile || !audioUrl) {
		return (
			<div className="relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
				<div className="absolute -right-2 -top-4 z-10">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-muted focus-visible:outline-none"
						onClick={toggleRetracted}
						title="Retract uploader"
					>
						<Upload className="h-4 w-4 text-muted-foreground rotate-180" />
					</Button>
				</div>
				<div
					className={cn(
						'w-full max-w-xl mx-auto p-6 rounded-xl transition-all duration-200',
						'border-2 border-dashed flex flex-col items-center justify-center',
						'bg-card hover:bg-muted/30',
						isDragging
							? 'border-primary border-opacity-70 bg-primary/5'
							: 'border-muted-foreground/20'
					)}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
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
						onChange={handleInputChange}
					/>
					<Button
						variant="outline"
						className="mt-2"
						onClick={handleBrowseClick}
					>
						Browse Files
					</Button>
					<p className="text-xs text-muted-foreground mt-4">
						Supports MP3, WAV, OGG, FLAC
					</p>
				</div>
			</div>
		);
	}

	// Player state
	return (
		<div className="relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
			<div className="absolute -right-2 -top-4 z-10 flex gap-2">
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-muted focus-visible:outline-none"
					onClick={toggleRetracted}
					title="Retract player"
				>
					<Upload className="h-4 w-4 text-muted-foreground rotate-180" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-destructive/10 focus-visible:outline-none"
					onClick={() => setShowConfirmDialog(true)}
					title="Remove audio"
				>
					<X className="h-4 w-4 text-muted-foreground" />
				</Button>
			</div>
			<TrackPlayer
				title={audioFile.name}
				icon={Music}
				iconColor={iconColor}
				src={audioUrl}
				showDownload={showDownload}
			/>

			<AlertDialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove track?</AlertDialogTitle>
						<AlertDialogDescription>
							This action will remove the current audio track.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleRemoveAudio}>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
