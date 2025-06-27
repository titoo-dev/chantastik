import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import { LyricList } from './lyric-list';
import { memo } from 'react';
import { Music } from 'lucide-react';
import { LyricsListSkeleton } from './lyrics-list-skeleton';
import RenderWhen from '../render-when';
import { useLyricEditor } from '@/hooks/use-lyric-editor';
import { createLineAdder, createTimestampSetter } from '@/lib/utils';
import { useLyricSync } from '@/hooks/use-lyric-sync';

const getCardClassName = (
	showExternalLyrics: boolean,
	showVideoPreview: boolean
) => {
	return `pt-0 shadow-none ${showExternalLyrics || showVideoPreview ? 'col-span-1' : 'col-span-2'}`;
};

const Error = ({ cardClassName }: { cardClassName: string }) => (
	<Card className={cardClassName}>
		<LyricHeader />
		<CardContent className="p-6">
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-destructive/10 p-4 mb-4">
					<Music className="h-10 w-10 text-primary" />
				</div>
				<h3 className="mb-2 text-lg font-semibold text-foreground">
					Failed to Load Lyrics
				</h3>
				<p className="text-sm text-muted-foreground max-w-md">
					There was an error loading the lyrics for this project. You
					can still create new lyrics manually.
				</p>
			</div>
		</CardContent>
	</Card>
);

const NoTrack = () => (
	<div className="flex flex-col items-center justify-center py-12 text-center">
		<div className="rounded-full bg-primary/10 p-4 mb-4">
			<Music className="h-10 w-10 text-primary" />
		</div>
		<h3 className="mb-2 text-lg font-semibold text-foreground">
			No Track Loaded
		</h3>
		<p className="text-sm text-muted-foreground max-w-md">
			Please load an audio track to start creating lyrics. You can upload
			a file or paste a YouTube URL to get started.
		</p>
	</div>
);

export const LyricEditor = memo(function LyricEditor() {
	const {
		audioRef,
		lyricLines,
		showExternalLyrics,
		showVideoPreview,
		trackLoaded,
		serverLyrics,
		isLoadingLyrics,
		lyricsError,
		updateLyricLine,
		deleteLyricLine,
		addLyricLine,
	} = useLyricEditor();

	useLyricSync(serverLyrics, lyricLines);

	const setCurrentTimeAsTimestamp = createTimestampSetter(
		audioRef,
		updateLyricLine
	);
	const handleAddLineBelow = createLineAdder(addLyricLine, audioRef);
	const cardClassName = getCardClassName(
		showExternalLyrics,
		showVideoPreview
	);

	if (lyricLines.length === 0 && isLoadingLyrics && trackLoaded) {
		return <LyricsListSkeleton className={cardClassName} />;
	}

	if (lyricLines.length === 0 && lyricsError && trackLoaded) {
		return <Error cardClassName={cardClassName} />;
	}

	return (
		<Card className={cardClassName}>
			<LyricHeader />
			<CardContent className="p-6">
				<RenderWhen condition={!trackLoaded}>
					<NoTrack />
				</RenderWhen>
				<RenderWhen
					condition={trackLoaded && lyricLines.length === 0}
					fallback={
						<RenderWhen condition={trackLoaded}>
							<LyricList
								lyricLines={lyricLines}
								onUpdateLine={updateLyricLine}
								onDeleteLine={deleteLyricLine}
								onSetCurrentTime={setCurrentTimeAsTimestamp}
								onAddLineBelow={handleAddLineBelow}
								onAddLine={() => addLyricLine({ audioRef })}
							/>
						</RenderWhen>
					}
				>
					<EmptyLyrics onAddLine={() => addLyricLine()} />
				</RenderWhen>
			</CardContent>
		</Card>
	);
});
