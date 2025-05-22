import { downloadAudioFile } from '@/data/api';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Controls, type AudioPlayerState } from './track-player/controls';
import { Waveform } from './track-player/wave-form';
import { useAppContext } from '@/hooks/use-app-context';

type TrackPlayerProps = {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload?: boolean;
	onLoadedMetadata: () => void;
};

export function TrackPlayer({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload = true,
	onLoadedMetadata,
	coverArt = '/default-cover-art.jpg', // Add default cover art path
}: TrackPlayerProps & {
	coverArt?: string; // Add optional cover art prop
}) {
	const { audioRef, videoRef, setVideoTime } = useAppContext();
	const playerRef = useRef<HTMLDivElement>(null);
	const [waveBars] = useState(
		Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2)
	);
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
	}, [audioRef]);

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
				pauseVideo();
			} else {
				audioRef.current.play();
				setVideoTime(audioState.currentTime);
				playVideo();
			}
			setAudioState((s) => ({ ...s, isPlaying: !s.isPlaying }));
		}
	};

	const playVideo = () => {
		if (videoRef.current) {
			setVideoTime(audioRef.current?.currentTime || 0);
			videoRef.current.play();
		}
	};

	const pauseVideo = () => {
		if (videoRef.current) {
			videoRef.current.pause();
		}
	};

	const handleTimeChange = (value: number[]) => {
		const newTime = value[0];
		if (audioRef.current) {
			audioRef.current.currentTime = newTime;
			if (!audioState.isPlaying) {
				audioRef.current.play();
			}
			playVideo();
			setAudioState((s) => ({ ...s, currentTime: newTime }));
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

	return (
		<div
			className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/95"
			ref={playerRef}
			tabIndex={0}
		>
			<div className="flex flex-col gap-6">
				{/* Track Header */}
				<div className="flex items-center justify-between">
					<h3 className="flex items-center gap-2 font-medium">
						<Icon className={`h-4 w-4 ${iconColor}`} />
						<span className="text-sm">{title}</span>
					</h3>
					<div className="flex items-center gap-1">
						{showDownload && (
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 rounded-full"
								onClick={() => downloadAudioFile(src)}
								title="Download track"
							>
								<Download className="h-3.5 w-3.5" />
							</Button>
						)}
					</div>
				</div>

				{/* Player Content */}
				<div className="flex items-center gap-5">
					{/* Cover Art */}
					<div
						className={`relative aspect-square w-24 sm:w-28 md:w-32 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
							audioState.isPlaying
								? 'ring-2 ring-primary/70 ring-offset-2 dark:ring-offset-background'
								: ''
						}`}
						onClick={handlePlayPause}
					>
						<img
							src={coverArt}
							alt={`Cover art for ${title}`}
							className="w-full h-full object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									'/default-cover-art.jpg';
							}}
						/>
					</div>

					{/* Controls */}
					<div className="flex-1">
						<div className="mb-3">
							<Waveform
								bars={waveBars}
								currentTime={audioState.currentTime}
								duration={audioState.duration}
								isPlaying={audioState.isPlaying}
								onBarClick={handleWaveBarClick}
							/>
						</div>

						<Controls
							audioState={audioState}
							onPlayPause={handlePlayPause}
							onTimeChange={handleTimeChange}
							onVolumeChange={handleVolumeChange}
							onMuteToggle={handleMuteToggle}
						/>
					</div>
				</div>
			</div>

			<audio
				ref={audioRef}
				src={src}
				className="hidden"
				onLoadedMetadata={onLoadedMetadata}
			/>
		</div>
	);
}
