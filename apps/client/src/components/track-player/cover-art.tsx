import { memo } from 'react';
import { CoverArtImage } from './cover-art-image';
import { PlayingRing } from './playing-ring';

export const CoverArt = memo(
	({ coverArt, title }: { coverArt: string; title: string }) => {
		return (
			<div className="relative">
				<CoverArtImage coverArt={coverArt} title={title} />
				<PlayingRing />
			</div>
		);
	}
);
