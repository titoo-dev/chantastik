import { TrackPlayerContainer } from './track-player-container';
import { TrackPlayerContent } from './track-player-content';

type TrackPlayerProps = {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload?: boolean;
};

export function TrackPlayer({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload = true,
	coverArt = '/default-cover-art.jpg',
}: TrackPlayerProps & {
	coverArt?: string;
}) {
	return (
		<TrackPlayerContainer>
			<TrackPlayerContent
				title={title}
				icon={Icon}
				iconColor={iconColor}
				src={src}
				showDownload={showDownload}
				coverArt={coverArt}
			/>
		</TrackPlayerContainer>
	);
}
