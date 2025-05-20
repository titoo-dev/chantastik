import { useAppContext } from '@/hooks/use-app-context';
import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import { LyricList } from './lyric-list';
import { memo } from 'react';

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
	} = useAppContext();
	return (
		<Card
			className={`pt-0 shadow-none ${showPreview || showExternalLyrics || showVideoPreview ? 'col-span-1' : 'col-span-2'}`}
		>
			<LyricHeader />

			<CardContent className="p-6">
				{lyricLines.length === 0 ? (
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
