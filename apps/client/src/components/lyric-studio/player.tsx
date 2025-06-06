import type { LyricsProps } from '@/remotion/schema';
import { RetroReel } from '@/remotion/themes/retro-reel';
import { Player, type PlayerRef } from '@remotion/player';

export const PlayerOnly: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
	inputProps: LyricsProps;
	totalFrames: number;
}> = ({ playerRef, inputProps, totalFrames }) => {
	return (
		<Player
			ref={playerRef}
			component={RetroReel}
			inputProps={{
				...inputProps,
			}}
			durationInFrames={totalFrames}
			fps={30}
			compositionWidth={1280}
			compositionHeight={720}
			logLevel="trace"
			style={{
				width: '100%',
			}}
		/>
	);
};
