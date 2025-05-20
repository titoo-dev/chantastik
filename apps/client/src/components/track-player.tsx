import { downloadAudioFile } from '@/data/api';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';
import { Download, AudioLines } from 'lucide-react';
import { Controls, type AudioPlayerState } from './track-player/controls';
import { Waveform } from './track-player/wave-form';
import { useAppContext } from '@/hooks/use-app-context';

type TrackPlayerProps = {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload?: boolean;
};

export function TrackPlayer({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload = true,
	showWaveform = true,
	onTimeUpdate,
}: TrackPlayerProps & {
	showWaveform?: boolean;
	onTimeUpdate?: (time: number) => void;
}) {
	const { audioRef } = useAppContext();
	const playerRef = useRef<HTMLDivElement>(null);
	const [waveBars] = useState(
		Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2)
	);
	const [isWaveformVisible, setIsWaveformVisible] = useState(showWaveform);
	const [audioState, setAudioState] = useState<AudioPlayerState>({
		isPlaying: false,
		duration: 0,
		currentTime: 0,
		volume: 1,
		isMuted: false,
	});

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlers = {
			loadedmetadata: () =>
				setAudioState((oldState) => ({
					...oldState,
					duration: audio.duration,
				})),
			timeupdate: () => {
				setAudioState((oldState) => ({
					...oldState,
					currentTime: audio.currentTime,
				}));
				if (onTimeUpdate) {
					onTimeUpdate(audio.currentTime);
				}
			},
			ended: () => setAudioState((s) => ({ ...s, isPlaying: false })),
		};

		Object.entries(handlers).forEach(([event, handler]) => {
			audio.addEventListener(event, handler);
		});

		return () => {
			Object.entries(handlers).forEach(([event, handler]) => {
				audio?.removeEventListener(event, handler);
			});
		};
	}, [audioRef, onTimeUpdate]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.code === 'Space' &&
				playerRef.current &&
				(playerRef.current.contains(document.activeElement) ||
					document.activeElement === document.body)
			) {
				e.preventDefault();
				handlePlayPause();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [audioState.isPlaying]);

	const handlePlayPause = () => {
		if (audioRef.current) {
			if (audioState.isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setAudioState((s) => ({ ...s, isPlaying: !s.isPlaying }));
		}
	};

	const handleTimeChange = (value: number[]) => {
		const newTime = value[0];
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
			setAudioState((s) => ({ ...s, currentTime: newTime }));
			if (onTimeUpdate) {
				onTimeUpdate(newTime);
			}
		}
	};

	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		if (audioRef.current) {
			audioRef.current.volume = newVolume;
			setAudioState((s) => ({ ...s, volume: newVolume }));
		}
	};

	const handleMuteToggle = () => {
		if (audioRef.current) {
			audioRef.current.muted = !audioState.isMuted;
			setAudioState((s) => ({ ...s, isMuted: !s.isMuted }));
		}
	};

	const handleWaveBarClick = (index: number) => {
		if (audioRef.current && audioState.duration) {
			const newTime = (index / waveBars.length) * audioState.duration;
			handleTimeChange([newTime]);
		}
	};

	const toggleWaveform = () => {
		setIsWaveformVisible(!isWaveformVisible);
	};

	return (
		<div
			className="rounded-lg border bg-card p-5"
			ref={playerRef}
			tabIndex={0}
		>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="flex items-center gap-2 font-semibold">
					<Icon className={`h-5 w-5 ${iconColor}`} />
					{title}
				</h3>
				<div className="flex items-center gap-2">
					{showWaveform && (
						<Button
							variant={isWaveformVisible ? 'default' : 'ghost'}
							size="icon"
							className="h-8 w-8 rounded-full"
							onClick={toggleWaveform}
							title={
								isWaveformVisible
									? 'Hide waveform'
									: 'Show waveform'
							}
						>
							<AudioLines className="h-4 w-4" />
						</Button>
					)}
					{showDownload && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 rounded-full"
							onClick={() => downloadAudioFile(src)}
							title="Download track"
						>
							<Download className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			<audio ref={audioRef} src={src} className="hidden" />

			{showWaveform && isWaveformVisible && (
				<Waveform
					bars={waveBars}
					currentTime={audioState.currentTime}
					duration={audioState.duration}
					isPlaying={audioState.isPlaying}
					onBarClick={handleWaveBarClick}
				/>
			)}

			<Controls
				audioState={audioState}
				onPlayPause={handlePlayPause}
				onTimeChange={handleTimeChange}
				onVolumeChange={handleVolumeChange}
				onMuteToggle={handleMuteToggle}
			/>
		</div>
	);
}
