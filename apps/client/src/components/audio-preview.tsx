import { Music } from 'lucide-react';
import { TrackPlayer } from './track-player';

export function AudioPreview({ audioUrl }: { audioUrl: string }) {
	return (
		<div className="flex flex-col space-y-2">
			<label className="text-sm font-medium">Preview</label>
			<TrackPlayer
				title="Audio Preview"
				icon={Music}
				iconColor="text-primary"
				src={audioUrl}
				showDownload={false}
			/>
		</div>
	);
}
