import type { AspectRatioType } from '@/data/types';
import type { LyricsProps } from '@/remotion/schema';
import { Player, type PlayerRef } from '@remotion/player';
import { useCallback } from 'react';

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

	return (
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
	);
};
