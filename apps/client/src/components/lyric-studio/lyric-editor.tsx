import { useAppContext } from '@/hooks/use-app-context';
import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import { LyricList } from './lyric-list';
import { memo } from 'react';
import { Music } from 'lucide-react';

export const LyricEditor = memo(function LyricEditor() {
	const {
		lyricLines,
		updateLyricLine,
		deleteLyricLine,
		setCurrentTimeAsTimestamp,
		addLyricLine,
		showPreview,
		showExternalLyrics,
		showVideoPreview,
		trackLoaded,
	} = useAppContext();
	return (
		<Card
			className={`pt-0 shadow-none ${showPreview || showExternalLyrics || showVideoPreview ? 'col-span-1' : 'col-span-2'}`}
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
						onAddLine={() => addLyricLine()}
					/>
				)}
			</CardContent>
		</Card>
	);
});
