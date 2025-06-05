import { TrackHeader } from './track-header';
import { TrackPlayerMain } from './track-player-main';
import { Audio } from '@/components/audio';

export function TrackPlayerContent({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload,
	coverArt,
}: {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload: boolean;
	coverArt: string;
}) {
	return (
		<div className="flex flex-col gap-6">
			<TrackHeader
				title={title}
				icon={Icon}
				iconColor={iconColor}
				src={src}
				showDownload={showDownload}
			/>
			<TrackPlayerMain coverArt={coverArt} title={title} />
			<Audio />
		</div>
	);
}
