import type { LyricsProps } from '@/remotion/schema';
import { VibrantMemories } from '@/remotion/themes/vibrant-memories';
import { Player, type PlayerRef } from '@remotion/player';

export const PlayerOnly: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
	inputProps: LyricsProps;
	totalFrames: number;
}> = ({ playerRef, inputProps, totalFrames }) => {
	return (
		<Player
			ref={playerRef}
			component={VibrantMemories}
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
