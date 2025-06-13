import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import { LyricList } from './lyric-list';
import { memo, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useGetLyrics } from '@/hooks/use-get-lyrics';
import { LyricsListSkeleton } from './lyrics-list-skeleton';

export const LyricEditor = memo(function LyricEditor() {
	const { audioRef } = useAudioRefContext();

	const { updateLyricLine, deleteLyricLine, addLyricLine, projectId } =
		useAppStore.getState();

	const { lyricLines, showExternalLyrics, showVideoPreview, trackLoaded } =
		useAppStore(
			useShallow((state) => ({
				lyricLines: state.lyricLines,
				showExternalLyrics: state.showExternalLyrics,
				showVideoPreview: state.showVideoPreview,
				trackLoaded: state.trackLoaded,
				projectId: state.projectId,
			}))
		);

	// Get lyrics from server
	const {
		data: serverLyrics,
		isLoading: isLoadingLyrics,
		error: lyricsError,
	} = useGetLyrics({
		projectId: projectId || '',
		enabled: !!projectId && trackLoaded,
	});

	// Sync server lyrics with local state when loaded
	useEffect(() => {
		if (serverLyrics?.lines && serverLyrics.lines.length > 0) {
			// Only sync if local lyrics are empty or different
			const hasLocalLyrics = lyricLines.length > 0;
			const isDifferent =
				!hasLocalLyrics ||
				serverLyrics.lines.length !== lyricLines.length ||
				serverLyrics.lines.some(
					(line, index) =>
						line.text !== lyricLines[index]?.text ||
						line.timestamp !== lyricLines[index]?.timestamp
				);

			if (isDifferent) {
				// Update local state with server lyrics
				useAppStore.setState({ lyricLines: serverLyrics.lines });
			}
		}
	}, [serverLyrics?.id, lyricLines.length]);

	const setCurrentTimeAsTimestamp = (id: number) => {
		if (audioRef?.current) {
			const newTimestamp = audioRef.current.currentTime;
			updateLyricLine(id, { timestamp: newTimestamp });
		}
	};

	const handleAddLineBelow = (afterId: number) => {
		addLyricLine({
			afterId,
			audioRef,
		});
	};

	if (lyricLines.length === 0 && isLoadingLyrics && trackLoaded) {
		return <LyricsListSkeleton />;
	}

	if (lyricLines.length === 0 && lyricsError && trackLoaded) {
		return (
			<Card
				className={`pt-0 shadow-none ${showExternalLyrics || showVideoPreview ? 'col-span-1' : 'col-span-2'}`}
			>
				<LyricHeader />
				<CardContent className="p-6">
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="rounded-full bg-destructive/10 p-4 mb-4">
							<Music className="h-10 w-10 text-destructive" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-foreground">
							Failed to Load Lyrics
						</h3>
						<p className="text-sm text-muted-foreground max-w-md">
							There was an error loading the lyrics for this
							project. You can still create new lyrics manually.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={`pt-0 shadow-none ${showExternalLyrics || showVideoPreview ? 'col-span-1' : 'col-span-2'}`}
		>
			<LyricHeader />

			<CardContent className="p-6">
				{!trackLoaded ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="rounded-full bg-primary/10 p-4 mb-4">
							<Music className="h-10 w-10 text-primary" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-foreground">
							No Track Loaded
						</h3>
						<p className="text-sm text-muted-foreground max-w-md">
							Please load an audio track to start creating lyrics.
							You can upload a file or paste a YouTube URL to get
							started.
						</p>
					</div>
				) : lyricLines.length === 0 ? (
					<EmptyLyrics onAddLine={() => addLyricLine()} />
				) : (
					<LyricList
						lyricLines={lyricLines}
						onUpdateLine={updateLyricLine}
						onDeleteLine={deleteLyricLine}
						onSetCurrentTime={setCurrentTimeAsTimestamp}
						onAddLineBelow={handleAddLineBelow}
						onAddLine={() =>
							addLyricLine({
								audioRef,
							})
						}
					/>
				)}
			</CardContent>
		</Card>
	);
});
