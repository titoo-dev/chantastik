import { CoverArt } from './cover-art';
import { PlayerControls } from './player-controls';

export function TrackPlayerMain({
	coverArt,
	title,
}: {
	coverArt: string;
	title: string;
}) {
	return (
		<div className="flex items-center gap-5">
			<CoverArt coverArt={coverArt} title={title} />
			<PlayerControls />
		</div>
	);
}
