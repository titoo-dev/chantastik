import type { LyricsProps } from '@/remotion/schema';
import { Player, type PlayerRef } from '@remotion/player';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Monitor, Smartphone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import RenderWhen from '../render-when';

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
		<div>
			<div className="space-y-3">
				<div className="flex gap-2 items-center">
					<RenderWhen
						condition={
							import.meta.env.VITE_NODE_ENV === 'development'
						}
					>
						<div className='flex space-x-2 py-3'>
							<Button
								variant={
									aspectRatio === 'horizontal'
										? 'default'
										: 'outline'
								}
								size="sm"
								onClick={() => setAspectRatio('horizontal')}
							>
								<Monitor className="w-4 h-4 mr-2" />
								YouTube
							</Button>
							<Button
								variant={
									aspectRatio === 'vertical'
										? 'default'
										: 'outline'
								}
								size="sm"
								onClick={() => setAspectRatio('vertical')}
							>
								<Smartphone className="w-4 h-4 mr-2" />
								TikTok
							</Button>
						</div>
					</RenderWhen>
					<div className="flex-1" />
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<Info className="w-4 h-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80">
							<p className="text-sm">
								If you close and reopen the video player, it may
								lose sync with the audio or stop playing. Simply
								restart playback.
							</p>
						</PopoverContent>
					</Popover>
				</div>
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
