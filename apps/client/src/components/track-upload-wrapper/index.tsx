import { MoveDiagonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingProgress } from '@/components/track-upload-wrapper/loading-progress';
import { RetractButton } from '@/components/track-upload-wrapper/retract-button';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/track-upload-wrapper/upload-zone';
import { ControlButtons } from '@/components/track-upload-wrapper/control-buttons';
import { PlayerSection } from '@/components/track-upload-wrapper/player-section';
import { createDeleteConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
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
		return <LoadingProgress audioFileName={audioFile?.name} />;
	}

	return (
		<>
			<RetractButton
				isRetracted={isRetracted}
				hasAudio={!!audio?.id}
				onToggle={toggleRetracted}
			/>

			{/* Upload interface */}
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

				<UploadZone
					isDragging={isDragging}
					isUploading={isUploading}
					fileInputRef={fileInputRef}
					onInputChange={handleInputChange}
					onBrowseClick={handleBrowseClick}
					dragHandlers={dragHandlers}
				/>
			</div>

			{/* Player interface */}
			<div
				className={cn(
					'relative w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300',
					audio?.id && !isRetracted
						? 'opacity-100'
						: 'opacity-0 pointer-events-none'
				)}
			>
				<ControlButtons
					onRetract={toggleRetracted}
					onRemove={() => setShowConfirmDialog(true)}
					isUploading={isUploading}
				/>

				{audio?.id && (
					<PlayerSection
						audio={audio}
						audioFile={audioFile}
						audioMetadata={audioMetadata}
						iconColor={iconColor}
						showDownload={showDownload}
					/>
				)}

				{createDeleteConfirmationDialog({
					open: showConfirmDialog,
					onOpenChange: setShowConfirmDialog,
					onConfirm: handleRemoveAudio,
					isLoading: false,
					title: 'Remove Track',
					description: 'Are you sure you want to remove this track?',
					confirmText: 'Remove',
				})}
			</div>
		</>
	);
}
