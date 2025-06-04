import { downloadAudioFile } from '@/data/api';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Controls } from './track-player/controls';
import { Waveform } from './track-player/wave-form';
import { useAppContext } from '@/hooks/use-app-context';
import { useTrackPlayer } from '@/hooks/use-track-player';

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
	coverArt = '/default-cover-art.jpg',
}: TrackPlayerProps & {
	coverArt?: string;
}) {
	const {
		playerRef,
		audioState,
		waveBars,
		handlePlayPause,
		handleTimeChange,
		handleVolumeChange,
		handleMuteToggle,
		handleWaveBarClick,
	} = useTrackPlayer();

	const { audioRef } = useAppContext();

	return (
		<div
			className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/95 with-blur"
			ref={playerRef}
			tabIndex={0}
		>
			<div className="flex flex-col gap-6">
				{/* Track Header */}
				<div className="flex items-center justify-between">
					<h3 className="flex items-center gap-2 font-medium">
						<Icon className={`h-4 w-4 ${iconColor}`} />
						<span className="text-sm max-w-96 truncate">
							{title}
						</span>
					</h3>
					<div className="flex items-center gap-1">
						{showDownload && (
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 rounded-full hover:bg-accent hover:text-accent-foreground"
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

			<audio ref={audioRef} src={src} className="hidden" />
		</div>
	);
}
