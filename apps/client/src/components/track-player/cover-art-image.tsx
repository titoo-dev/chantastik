import { useTrackPlayer } from '@/hooks/use-track-player';
import { memo } from 'react';

export const CoverArtImage = memo(
	({ coverArt, title }: { coverArt: string; title: string }) => {
		const { handlePlayPause } = useTrackPlayer();

		return (
			<div
				className="aspect-square w-24 sm:w-28 md:w-32 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
				onClick={handlePlayPause}
			>
				<img
					src={coverArt}
					alt={`Cover art for ${title}`}
					className="w-full h-full object-cover"
					onError={(e) => {
						(e.target as HTMLImageElement).src =
							'/default-cover-art.jpg';
					}}
				/>
			</div>
		);
	}
);
