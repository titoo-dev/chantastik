import type { AspectRatioType } from '@/data/types';
import type { LyricsProps } from '@/remotion/schema';
import { Player, type PlayerRef } from '@remotion/player';
import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Expand } from 'lucide-react';

type Props = {
	playerRef: React.RefObject<PlayerRef | null>;
	inputProps: LyricsProps;
	totalFrames: number;
	aspectRatio: AspectRatioType;
};

export const VideoPlayer: React.FC<Props> = ({
	playerRef,
	inputProps,
	totalFrames,
	aspectRatio,
}) => {
	const lazyComponent = useCallback(() => {
		return import('@/remotion/themes/retro-reel');
	}, []);

	const getCompositionDimensions = (ratio: AspectRatioType) => {
		if (ratio === 'vertical') {
			return { width: 720, height: 1280 }; // TikTok format (9:16)
		}
		return { width: 1280, height: 720 }; // YouTube format (16:9)
	};

	const dimensions = getCompositionDimensions(aspectRatio);

	const handleFullScreen = () => {
		if (playerRef.current) {
			playerRef.current.requestFullscreen();
		}
	};

	return (
		<div className="relative group">
			<Player
				ref={playerRef}
				lazyComponent={lazyComponent}
				inputProps={{
					...inputProps,
				}}
				durationInFrames={totalFrames}
				fps={30}
				compositionWidth={dimensions.width}
				compositionHeight={dimensions.height}
				logLevel="trace"
				style={{
					width: '100%',
				}}
				acknowledgeRemotionLicense
			/>
			<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
				<Button
					onClick={handleFullScreen}
					variant="ghost"
					size="icon"
					className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white h-12 w-12"
					aria-label="Enter fullscreen"
				>
					<Expand className="h-6 w-6" />
				</Button>
			</div>
		</div>
	);
};
