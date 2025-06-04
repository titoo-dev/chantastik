import { downloadAudioFile } from '@/data/api';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Controls } from './track-player/controls';
import { Waveform } from './track-player/wave-form';
import { useAppContext } from '@/hooks/use-app-context';
import { useTrackPlayer } from '@/hooks/use-track-player';
import { useRef } from 'react';
import { memo } from 'react';

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
	return (
		<TrackPlayerContainer>
			<TrackPlayerContent
				title={title}
				icon={Icon}
				iconColor={iconColor}
				src={src}
				showDownload={showDownload}
				coverArt={coverArt}
			/>
		</TrackPlayerContainer>
	);
}

function TrackPlayerContainer({ children }: { children: React.ReactNode }) {
	const playerRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/95 with-blur"
			ref={playerRef}
			tabIndex={0}
		>
			{children}
		</div>
	);
}

function TrackPlayerContent({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload,
	coverArt,
}: {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload: boolean;
	coverArt: string;
}) {
	const { audioRef } = useAppContext();

	return (
		<div className="flex flex-col gap-6">
			<TrackHeader
				title={title}
				icon={Icon}
				iconColor={iconColor}
				src={src}
				showDownload={showDownload}
			/>
			<TrackPlayerMain coverArt={coverArt} title={title} />
			<audio ref={audioRef} src={src} className="hidden" />
		</div>
	);
}

function TrackHeader({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload,
}: {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<h3 className="flex items-center gap-2 font-medium">
				<Icon className={`h-4 w-4 ${iconColor}`} />
				<span className="text-sm max-w-96 truncate">{title}</span>
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
	);
}

function TrackPlayerMain({
	coverArt,
	title,
}: {
	coverArt: string;
	title: string;
}) {
	const { audioState, handlePlayPause } = useTrackPlayer();

	return (
		<div className="flex items-center gap-5">
			<CoverArt
				coverArt={coverArt}
				title={title}
				isPlaying={audioState.isPlaying}
				onPlayPause={handlePlayPause}
			/>
			<PlayerControls />
		</div>
	);
}

const CoverArtImage = memo(
	({ coverArt, title }: { coverArt: string; title: string }) => (
		<img
			src={coverArt}
			alt={`Cover art for ${title}`}
			className="w-full h-full object-cover"
			onError={(e) => {
				(e.target as HTMLImageElement).src = '/default-cover-art.jpg';
			}}
		/>
	)
);

function CoverArt({
	coverArt,
	title,
	isPlaying,
	onPlayPause,
}: {
	coverArt: string;
	title: string;
	isPlaying: boolean;
	onPlayPause: () => void;
}) {
	return (
		<div className="relative">
			<div
				className="aspect-square w-24 sm:w-28 md:w-32 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
				onClick={onPlayPause}
			>
				<CoverArtImage coverArt={coverArt} title={title} />
			</div>
			<div
				className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ease-in-out ${
					isPlaying
						? 'ring-2 ring-primary/70 ring-offset-2 dark:ring-offset-background opacity-100'
						: 'ring-0 ring-transparent ring-offset-0 opacity-0'
				}`}
			/>
		</div>
	);
}

function PlayerControls() {
	const {
		audioState,
		waveBars,
		handlePlayPause,
		handleTimeChange,
		handleVolumeChange,
		handleMuteToggle,
		handleWaveBarClick,
	} = useTrackPlayer();

	return (
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
	);
}
