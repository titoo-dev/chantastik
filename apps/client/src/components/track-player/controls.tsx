import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useTrackPlayer } from '@/hooks/use-track-player';

export const Controls = () => {
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};

	const {
		audioState,
		handlePlayPause,
		handleTimeChange,
		handleVolumeChange,
		handleMuteToggle,
	} = useTrackPlayer();

	return (
		<div className="mb-3 flex items-center gap-2">
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

			<span className="w-10 text-xs text-muted-foreground">
				{formatTime(audioState.currentTime)}
			</span>

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

			<span className="w-10 text-xs text-muted-foreground">
				{formatTime(audioState.duration)}
			</span>

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
		</div>
	);
};
