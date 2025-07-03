import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import { LyricList } from './lyric-list';
import { memo } from 'react';
import { Music, Undo2 } from 'lucide-react';
import { LyricsListSkeleton } from './lyrics-list-skeleton';
import RenderWhen from '../render-when';
import { createLineAdder, createTimestampSetter } from '@/lib/utils';
import { useLyricSync } from '@/hooks/use-lyric-sync';
import { Button } from '../ui/button';
import { useGetLyrics } from '@/hooks/use-get-lyrics';
import { useLyricEditor } from '@/hooks/use-lyric-editor';
import { useAppStore } from '@/stores/app/store';

type LyricEditorContentProps = {
	trackLoaded: boolean;
};

const LyricEditorContent = memo(function LyricEditorContent({
	trackLoaded,
}: LyricEditorContentProps) {
	const {
		audioRef,
		updateLyricLine,
		deleteLyricLine,
		addLyricLine,
		undo,
		editorLines,
		commandHistory,
		projectId,
	} = useLyricEditor();

	const {
		data: serverLyrics,
		isLoading: isLoadingLyrics,
		error: lyricsError,
	} = useGetLyrics({
		projectId: projectId || '',
		enabled: !!projectId && trackLoaded,
	});

	useLyricSync(serverLyrics, editorLines);

	const setCurrentTimeAsTimestamp = createTimestampSetter(
		audioRef,
		updateLyricLine
	);
	const handleAddLineBelow = createLineAdder(addLyricLine, audioRef);
	const cardClassName = getCardClassName(trackLoaded);

	if (editorLines.length === 0 && isLoadingLyrics && trackLoaded) {
		return <LyricsListSkeleton className={cardClassName} />;
	}

	if (editorLines.length === 0 && lyricsError && trackLoaded) {
		return <Error />;
	}

	const handleUndo = () => {
		if (commandHistory.commands.length > 0) {
			undo();
		}
	};

	return (
		<CardContent className="px-6">
			<RenderWhen condition={commandHistory.commands.length > 0}>
				<div className="flex items-center justify-end mb-4">
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9"
						onClick={handleUndo}
					>
						<Undo2 className="h-4 w-4" />
						<span className="sr-only">Undo Action</span>
					</Button>
				</div>
			</RenderWhen>
			<RenderWhen condition={!trackLoaded}>
				<NoTrack />
			</RenderWhen>
			<RenderWhen
				condition={trackLoaded && editorLines.length === 0}
				fallback={
					<RenderWhen condition={trackLoaded}>
						<LyricList
							lyricLines={editorLines}
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
	);
});

export const LyricEditor = memo(function LyricEditor() {
	const trackLoaded = useAppStore((state) => state.trackLoaded);

	const cardClassName = getCardClassName(trackLoaded);

	return (
		<Card className={cardClassName}>
			<LyricHeader />
			<LyricEditorContent trackLoaded={trackLoaded} />
		</Card>
	);
});

const getCardClassName = (trackLoaded: boolean) => {
	return `pt-0 shadow-none ${trackLoaded ? 'col-span-1' : 'col-span-2'}`;
};

const Error = () => (
	<div className="flex flex-col items-center justify-center py-12 text-center">
		<div className="rounded-full bg-destructive/10 p-4 mb-4">
			<Music className="h-10 w-10 text-primary" />
		</div>
		<h3 className="mb-2 text-lg font-semibold text-foreground">
			Failed to Load Lyrics
		</h3>
		<p className="text-sm text-muted-foreground max-w-md">
			There was an error loading the lyrics for this project. You can
			still create new lyrics manually.
		</p>
	</div>
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
