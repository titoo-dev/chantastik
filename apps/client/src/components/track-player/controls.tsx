import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useTrackPlayer } from '@/hooks/use-track-player';
import { memo } from 'react';

const formatTime = (time: number) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlayPauseButton = memo(() => {
	const { audioState, handlePlayPause } = useTrackPlayer();

	return (
		<Button
			variant="outline"
			size="icon"
			className="h-9 w-9 rounded-full"
			onClick={handlePlayPause}
		>
			{audioState.isPlaying ? (
				<Pause className="h-4 w-4" />
			) : (
				<Play className="h-4 w-4" />
			)}
		</Button>
	);
});

const CurrentTime = memo(() => {
	const { audioState } = useTrackPlayer();

	return (
		<div className="w-10 text-xs text-muted-foreground text-right">
			{formatTime(audioState.currentTime)}
		</div>
	);
});

const Duration = memo(() => {
	const { audioState } = useTrackPlayer();

	return (
		<div className="w-10 text-xs text-muted-foreground text-left">
			{formatTime(audioState.duration)}
		</div>
	);
});

const TimeSlider = memo(() => {
	const { audioState, handleTimeChange } = useTrackPlayer();

	return (
		<div className="flex-1">
			<Slider
				value={[audioState.currentTime]}
				min={0}
				max={audioState.duration || 100}
				step={0.1}
				onValueChange={handleTimeChange}
				className="hover:cursor-pointer"
			/>
		</div>
	);
});

const VolumeControls = memo(() => {
	const { audioState, handleVolumeChange, handleMuteToggle } =
		useTrackPlayer();

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				onClick={handleMuteToggle}
			>
				{audioState.isMuted ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>

			<Slider
				value={[audioState.isMuted ? 0 : audioState.volume]}
				min={0}
				max={1}
				step={0.01}
				onValueChange={handleVolumeChange}
				className="w-20"
			/>
		</>
	);
});

export const Controls = memo(() => {
	return (
		<div className="mb-3 flex items-center gap-2">
			<PlayPauseButton />
			<CurrentTime />
			<TimeSlider />
			<Duration />
			<VolumeControls />
		</div>
	);
});
