import type { LyricsProps } from '@/remotion/schema';
import { Player, type PlayerRef } from '@remotion/player';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

type AspectRatioType = 'horizontal' | 'vertical';

export const PlayerOnly: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
	inputProps: LyricsProps;
	totalFrames: number;
}> = ({ playerRef, inputProps, totalFrames }) => {
	const lazyComponent = useCallback(() => {
		return import('@/remotion/themes/retro-reel');
	}, []);

	const [aspectRatio, setAspectRatio] =
		useState<AspectRatioType>('horizontal');

	const getCompositionDimensions = (ratio: AspectRatioType) => {
		if (ratio === 'vertical') {
			return { width: 720, height: 1280 }; // TikTok format (9:16)
		}
		return { width: 1280, height: 720 }; // YouTube format (16:9)
	};

	const dimensions = getCompositionDimensions(aspectRatio);

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Button
					variant={
						aspectRatio === 'horizontal' ? 'default' : 'outline'
					}
					size="sm"
					onClick={() => setAspectRatio('horizontal')}
				>
					<Monitor className="w-4 h-4 mr-2" />
					YouTube
				</Button>
				<Button
					variant={aspectRatio === 'vertical' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setAspectRatio('vertical')}
				>
					<Smartphone className="w-4 h-4 mr-2" />
					TikTok
				</Button>
			</div>
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
		</div>
	);
};
