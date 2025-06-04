import { MoveDiagonal, Music, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrackPlayer } from './track-player';
import { Button } from './ui/button';
import { getAudioUrl, getCoverArtUrl } from '@/data/api';
import { createDeleteConfirmationDialog } from './dialogs/confirmation-dialog';
import { useTrackUpload } from '@/hooks/use-track-upload';

interface TrackUploadWrapperProps {
	iconColor?: string;
	showDownload?: boolean;
}

export function TrackUploadWrapper({
	iconColor = 'text-primary',
	showDownload = false,
}: TrackUploadWrapperProps) {
	const {
		// State
		audioFile,
		isDragging,
		showConfirmDialog,
		isRetracted,
		audio,
		audioMetadata,
		isUploading,
		isLoadingAudioMetadata,
		fileInputRef,

		// Actions
		handleInputChange,
		handleRemoveAudio,
		handleBrowseClick,
		toggleRetracted,
		setShowConfirmDialog,

		// Drag handlers
		dragHandlers,
	} = useTrackUpload();

	if (isUploading || isLoadingAudioMetadata) {
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
				title={audio ? 'Expand audio player' : 'Expand audio uploader'}
			>
				<span className="relative flex items-center justify-center w-6 h-6">
					{audio ? (
						<Music className="h-5 w-5 text-primary" />
					) : (
						<MoveDiagonal className="h-5 w-5 text-primary" />
					)}
				</span>
				<span className="font-medium text-sm">
					{audio?.id ? 'Show Player' : 'Upload Track'}
				</span>
			</Button>{' '}
			{/* Upload interface - only visible when not retracted and no audio exists */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					!audio?.id && !isRetracted
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
						onChange={handleInputChange}
						disabled={isUploading}
					/>
					<Button
						variant="outline"
						className="mt-2"
						onClick={handleBrowseClick}
						disabled={isUploading}
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
					audio?.id && !isRetracted
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
						disabled={isUploading}
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</Button>
				</div>{' '}
				{audio?.id && (
					<TrackPlayer
						title={
							audioMetadata?.metadata?.title &&
							audioMetadata?.metadata.artist
								? `${audioMetadata.metadata.title} - ${audioMetadata.metadata.artist}`
								: audioFile?.name || 'Unknown Track'
						}
						icon={Music}
						iconColor={iconColor}
						src={getAudioUrl(audio?.id ?? '')}
						showDownload={showDownload}
						coverArt={getCoverArtUrl(audio?.id)}
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
