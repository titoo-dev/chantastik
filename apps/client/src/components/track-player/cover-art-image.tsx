import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { usePlayerStore } from '@/stores/player/store';
import { memo, useCallback } from 'react';

export const CoverArtImage = memo(
	({ coverArt, title }: { coverArt: string; title: string }) => {
		const { audioRef } = useAudioRefContext();

		const isPlaying = usePlayerStore((state) => state.isPlaying);

		const handlePlayPause = useCallback(() => {
			if (!audioRef.current) return;
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
		}, [audioRef, isPlaying]);

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
