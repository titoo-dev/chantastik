import { Music } from 'lucide-react';
import { TrackPlayer } from '../track-player';
import { getAudioUrl, getCoverArtUrl } from '@/data/api';

interface PlayerSectionProps {
	audio: any;
	audioFile: File | null;
	audioMetadata: any;
	iconColor: string;
	showDownload: boolean;
}

export function PlayerSection({
	audio,
	audioFile,
	audioMetadata,
	iconColor,
	showDownload,
}: PlayerSectionProps) {
	const title =
		audioMetadata?.metadata?.title && audioMetadata?.metadata.artist
			? `${audioMetadata.metadata.title} - ${audioMetadata.metadata.artist}`
			: audioFile?.name || 'Unknown Track';

	return (
		<TrackPlayer
			title={title}
			icon={Music}
			iconColor={iconColor}
			src={getAudioUrl(audio?.id ?? '')}
			showDownload={showDownload}
			coverArt={getCoverArtUrl(audio?.id)}
		/>
	);
}
