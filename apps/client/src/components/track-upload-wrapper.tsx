import { useState, useRef, useEffect } from 'react';
import { MoveDiagonal, Music, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrackPlayer } from './track-player';
import { Button } from './ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import {
	getAudioMetadata,
	getAudioUrl,
	getCoverArtUrl,
	notifications,
	uploadAudioFile,
} from '@/data/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preloadImage } from '@remotion/preload';
import { createDeleteConfirmationDialog } from './dialogs/confirmation-dialog';

interface TrackUploadWrapperProps {
	iconColor?: string;
	showDownload?: boolean;
}

export function TrackUploadWrapper({
	iconColor = 'text-primary',
	showDownload = false,
}: TrackUploadWrapperProps) {
	const queryClient = useQueryClient();
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isRetracted, setIsRetracted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {
		setTrackLoaded,
		audioRef,
		resetAllStatesAndPlayers,
		audioId,
		updateAudioId,
	} = useAppContext(); // Preload cover art when audio ID changes
	useEffect(() => {
		if (audioId) {
			preloadImage(getCoverArtUrl(audioId));
		}
	}, [audioId]);

	// Fetch audio metadata using TanStack Query
	const { data: audioMetadata, isLoading: isLoadingAudioMetadata } = useQuery(
		{
			queryKey: ['audioMetadata', audioId],
			queryFn: () => getAudioMetadata(audioId || ''),
			enabled: !!audioId, // Only fetch if audioId is available
			retry: false, // Disable automatic retries
			refetchOnWindowFocus: false, // Don't refetch on window focus
			// Remove retryOnMount: false to allow refetching when audioId changes
		}
	);

	// File upload mutation
	const uploadMutation = useMutation({
		mutationFn: uploadAudioFile,
		onSuccess: (data) => {
			console.log('Upload successful:', data);
			notifications.uploadSuccess(data.message);
			updateAudioId(data.id);
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
		updateAudioId(undefined);
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

	const handleTrackLoaded = () => {
		setTrackLoaded(true);
		queryClient.invalidateQueries({ queryKey: ['projects'] });
	};

	if (uploadMutation.isPending || isLoadingAudioMetadata) {
		return (
			<div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-6 rounded-xl border-2 border-dashed border-primary/30 bg-background/95 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
				<div className="w-full max-w-md mx-auto mt-2 mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-muted-foreground">
							Processing
						</span>
						<span className="text-xs font-medium text-primary">
							{audioFile?.name}
						</span>
					</div>
					<div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30">
						{/* Animated gradient background */}
						<div
							className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full w-full"
							style={{
								backgroundSize: '200% 100%',
								animation: 'shimmer 2s infinite linear',
							}}
						/>

						{/* Glow effect */}
						<div
							className="absolute inset-0 w-full rounded-full bg-primary/20 blur-[3px]"
							style={{
								animation: 'pulse 1.5s infinite ease-in-out',
							}}
						/>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-1 text-center">
					This may take a moment depending on file size
				</p>
			</div>
		);
	}

	return (
		<>
			{/* Retracted button - always rendered but only visible when retracted */}
			<Button
				variant="outline"
				onClick={toggleRetracted}
				className={cn(
					'fixed inset-x-0 bottom-6 mx-auto flex items-center gap-3 px-6 h-12 rounded-full',
					'border-2 border-dotted border-primary/50 bg-background/80 backdrop-blur-sm',
					'shadow-sm hover:shadow-primary/20 hover:border-primary transition-all duration-300',
					'group max-w-xs',
					isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				)}
				title={
					audioId ? 'Expand audio player' : 'Expand audio uploader'
				}
			>
				<span className="relative flex items-center justify-center w-6 h-6">
					{audioId ? (
						<Music className="h-5 w-5 text-primary" />
					) : (
						<MoveDiagonal className="h-5 w-5 text-primary" />
					)}
				</span>
				<span className="font-medium text-sm">
					{audioId ? 'Show Player' : 'Upload Track'}
				</span>
			</Button>{' '}
			{/* Upload interface - only visible when not retracted and no audioId exists */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					!audioId && !isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none hidden'
				)}
			>
				<div className="absolute right-4 top-4 z-10">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-300 border border-muted/40"
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
						'bg-card',
						isDragging
							? 'border-primary border-opacity-70 bg-muted/30'
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
			</div>{' '}
			{/* Player interface - only visible when audioId exists and not retracted */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					audioId && !isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				)}
			>
				<div className="absolute right-4 top-4 z-10 flex gap-2">
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-transparent hover:bg-muted focus-visible:outline-1"
						onClick={toggleRetracted}
						title="Retract player"
					>
						<MoveDiagonal className="h-4 w-4 text-muted-foreground rotate-180" />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 rounded-full bg-transparent focus-visible:outline-1"
						onClick={() => setShowConfirmDialog(true)}
						title="Remove audio"
						disabled={uploadMutation.isPending}
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</Button>
				</div>{' '}
				{audioId && (
					<TrackPlayer
						title={
							audioMetadata?.metadata.title &&
							audioMetadata?.metadata.artist
								? `${audioMetadata.metadata.title} - ${audioMetadata.metadata.artist}`
								: audioFile?.name || 'Unknown Track'
						}
						icon={Music}
						iconColor={iconColor}
						src={getAudioUrl(audioId)}
						showDownload={showDownload}
						onLoadedMetadata={handleTrackLoaded}
						coverArt={getCoverArtUrl(audioId)}
					/>
				)}
				{createDeleteConfirmationDialog({
					open: showConfirmDialog,
					onOpenChange: setShowConfirmDialog,
					onConfirm: handleRemoveAudio,
					itemName: 'track',
					isLoading: false,
				})}
			</div>
		</>
	);
}
