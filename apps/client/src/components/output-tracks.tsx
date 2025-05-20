import { Mic, Music, RotateCcw } from 'lucide-react';
import { TrackPlayer } from './track-player';
import { Button } from './ui/button';
import { getOutputPath } from '@/data/api';
import { useState } from 'react';
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

export function OutputTracks({
	resetState,
	instrumentalOutputPath,
	vocalOutputPath,
}: {
	vocalOutputPath?: string;
	instrumentalOutputPath?: string;
	resetState: () => void;
}) {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	return (
		<div className="space-y-4">
			<TrackPlayer
				title="Vocals Track"
				icon={Mic}
				iconColor="text-primary"
				src={getOutputPath(vocalOutputPath)}
			/>

			<TrackPlayer
				title="Instrumental Track"
				icon={Music}
				iconColor="text-primary"
				src={getOutputPath(instrumentalOutputPath)}
			/>

			<Button
				variant="ghost"
				className="w-full"
				onClick={() => setShowConfirmDialog(true)}
			>
				<RotateCcw className="mr-2 h-4 w-4" />
				Process Another File
			</Button>

			<AlertDialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action will reset the current tracks and let
							you process a new file.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={resetState}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
