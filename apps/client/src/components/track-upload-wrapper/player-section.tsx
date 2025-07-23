import { getAudioUrl, getCoverArtUrl } from '@/data/api';
import { Music } from 'lucide-react';
import { TrackPlayer } from '../track-player';
import YoutubePlayer from '../track-player/youtube-player';

type PlayerSectionProps = {
	audio: any;
	audioFile: File | null;
	audioMetadata: any;
	iconColor: string;
	showDownload: boolean;
	isYoutube?: boolean;
};

export function PlayerSection({
	audio,
	audioFile,
	audioMetadata,
	iconColor,
	isYoutube = false,
	showDownload,
}: PlayerSectionProps) {
	const title =
		audioMetadata?.metadata?.title && audioMetadata?.metadata.artist
			? `${audioMetadata.metadata.title} - ${audioMetadata.metadata.artist}`
			: audioFile?.name || 'Unknown Track';

	return (
		<>
		{isYoutube
			? (<YoutubePlayer videoId={audio.id.replace('youtube-virtual-', '')} />)
			: (<TrackPlayer
				title={title}
				icon={Music}
				iconColor={iconColor}
				src={getAudioUrl(audio?.id ?? '')}
				showDownload={showDownload}
				coverArt={getCoverArtUrl(audio?.id)}
			/>)
		}
		</>
	);
}
