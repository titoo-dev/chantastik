import { useState, useRef } from 'react';
import { MoveDiagonal, Music, Upload, X } from 'lucide-react';
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
import { getAudioUrl, notifications, uploadAudioFile } from '@/data/api';
import { useMutation } from '@tanstack/react-query';

interface TrackUploadWrapperProps {
	iconColor?: string;
	showDownload?: boolean;
}

export function TrackUploadWrapper({
	iconColor = 'text-primary',
	showDownload = false,
}: TrackUploadWrapperProps) {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isRetracted, setIsRetracted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setTrackLoaded, audioRef, resetAllStatesAndPlayers } =
		useAppContext();

	// File upload mutation
	const uploadMutation = useMutation({
		mutationFn: uploadAudioFile,
		onSuccess: (data) => {
			console.log('Upload successful:', data);
			notifications.uploadSuccess(data.message);
			setAudioUrl(getAudioUrl(data.id));
		},
		onError: (error) => {
			console.error('Upload failed:', error);
			notifications.uploadError(error as Error);
		},
		retry: false, // Disable automatic retries
	});

	const handleFileChange = (file: File) => {
		setAudioFile(file);
		// Start upload process
		uploadMutation.mutate(file);
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
		setAudioFile(null);
		setAudioUrl(null);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
		}

		// Call the onAudioRemove callback if provided
		setTrackLoaded(false);
		resetAllStatesAndPlayers();
		uploadMutation.reset();
	};

	const handleBrowseClick = () => {
		fileInputRef.current?.click();
	};

	const toggleRetracted = () => {
		setIsRetracted(!isRetracted);
	};

	return (
		<>
			{/* Retracted button - always rendered but only visible when retracted */}
			<Button
				variant="outline"
				onClick={toggleRetracted}
				className={cn(
					'fixed inset-x-0 bottom-6 mx-auto flex items-center gap-3 px-6 h-12 rounded-full',
					'border-2 border-dotted border-primary/50 bg-background/80 backdrop-blur-sm',
					'shadow-md hover:shadow-primary/20 hover:border-primary transition-all duration-300',
					'group max-w-xs',
					isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				)}
				title={
					audioFile ? 'Expand audio player' : 'Expand audio uploader'
				}
			>
				<span className="relative flex items-center justify-center w-6 h-6">
					{audioFile ? (
						<Music className="h-5 w-5 text-primary" />
					) : (
						<MoveDiagonal className="h-5 w-5 text-primary" />
					)}
				</span>
				<span className="font-medium text-sm">
					{audioFile ? 'Show Player' : 'Upload Track'}
				</span>
			</Button>

			{/* Upload interface - only visible when not retracted and no file is uploaded */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					(!audioFile || !audioUrl) && !isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none hidden'
				)}
			>
				<div className="absolute -right-2 -top-4 z-10">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm 
							shadow-md hover:shadow-primary/20 hover:bg-primary/10 
							transition-all duration-300 border border-muted/40"
						onClick={toggleRetracted}
						title="Retract uploader"
					>
						<MoveDiagonal className="h-4 w-4 text-primary/80 rotate-180 group-hover:scale-105 transition-transform" />
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
						disabled={uploadMutation.isPending}
					/>
					<Button
						variant="outline"
						className="mt-2"
						onClick={handleBrowseClick}
						disabled={uploadMutation.isPending}
					>
						Browse Files
					</Button>
					<p className="text-xs text-muted-foreground mt-4">
						Supports MP3, WAV, OGG, FLAC
					</p>
				</div>
			</div>

			{/* Player interface - only visible when a file is uploaded and not retracted */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					audioFile && audioUrl && !isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				)}
			>
				<div className="absolute -right-4 -top-4 z-10 flex gap-2">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-destructive/10 focus-visible:outline-none"
						onClick={() => setShowConfirmDialog(true)}
						title="Remove audio"
						disabled={uploadMutation.isPending}
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</Button>
				</div>
				<div className="absolute -left-4 -bottom-4 z-10 flex gap-2">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-muted focus-visible:outline-none"
						onClick={toggleRetracted}
						title="Retract player"
					>
						<MoveDiagonal className="h-4 w-4 text-muted-foreground rotate-180" />
					</Button>
				</div>

				{/* Upload Progress Overlay */}
				{uploadMutation.isPending && (
					<div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
						<div className="w-full max-w-xs">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">
									Uploading...
								</span>
								<span className="text-sm font-medium">
									Processing
								</span>
							</div>
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-primary animate-pulse rounded-full" />
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Uploading {audioFile?.name}
							</p>
						</div>
					</div>
				)}

				{audioFile && audioUrl && (
					<TrackPlayer
						title={audioFile.name}
						icon={Music}
						iconColor={iconColor}
						src={audioUrl}
						showDownload={showDownload}
						onLoadedMetadata={() => {
							setTrackLoaded(true);
						}}
					/>
				)}

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
		</>
	);
}
