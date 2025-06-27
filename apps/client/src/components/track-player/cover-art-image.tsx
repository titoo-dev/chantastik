import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player/store';
import { memo, useCallback } from 'react';

export const CoverArtImage = memo(
	({ coverArt, title }: { coverArt: string; title: string }) => {
		const { audioRef } = useAudioRefContext();
		const { isMobile, isSmallMobile } = useResponsiveMobile();

		const isPlaying = usePlayerStore((state) => state.isPlaying);

		const handlePlayPause = useCallback(() => {
			if (!audioRef.current) return;
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
		}, [audioRef, isPlaying]);

		// Mobile-first sizing with responsive breakpoints
		const sizeClasses = isSmallMobile 
			? "w-14" 
			: isMobile 
			? "w-16" 
			: "w-24 sm:w-28 md:w-32";

		return (
			<div
				className={cn(
					"aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300",
					sizeClasses
				)}
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
