import { memo } from 'react';
import { Button } from '../ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '../ui/slider';
import { usePlayerStore } from '@/stores/player/store';
import { useShallow } from 'zustand/react/shallow';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';

export const VolumeControls = memo(() => {
	const { audioRef } = useAudioRefContext();

	const { setMuted, setVolume } = usePlayerStore.getState();

	const { volume, isMuted } = usePlayerStore(
		useShallow((state) => ({
			volume: state.volume,
			isMuted: state.muted,
		}))
	);

	const handleMuteToggle = () => {
		if (!audioRef.current) return;
		audioRef.current.muted = !isMuted;
		setMuted(!isMuted);
	};

	const handleVolumeChange = (value: number[]) => {
		if (!audioRef.current) return;
		const newVolume = value[0];
		audioRef.current.volume = newVolume;
		setVolume(newVolume);
	};

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				onClick={handleMuteToggle}
			>
				{isMuted ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</Button>

			<Slider
				value={[isMuted ? 0 : volume]}
				min={0}
				max={1}
				step={0.01}
				onValueChange={handleVolumeChange}
				className="w-20"
			/>
		</>
	);
});
