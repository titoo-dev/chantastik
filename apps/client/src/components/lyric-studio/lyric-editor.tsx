import { Card, CardContent } from '../ui/card';
import { EmptyLyrics } from './empty-lyrics';
import { LyricHeader } from './lyric-header';
import type { LyricLine } from './lyric-line-item';
import { LyricList } from './lyric-list';

export function LyricEditor({
	lyricLines,
	showPreview,
	setShowPreview,
	hasEmptyLyricLines,
	onUpdateLine,
	onDeleteLine,
	onSetCurrentTime,
	onAddLine,
	showExternalLyrics,
	setShowExternalLyrics,
}: {
	lyricLines: LyricLine[];
	showPreview: boolean;
	setShowPreview: (show: boolean) => void;
	hasEmptyLyricLines: () => boolean;
	onUpdateLine: (id: number, data: Partial<LyricLine>) => void;
	onDeleteLine: (id: number) => void;
	onSetCurrentTime: (id: number) => void;
	onAddLine: (afterId?: number) => void;
	showExternalLyrics: boolean;
	setShowExternalLyrics: (show: boolean) => void;
}) {
	return (
		<Card className="pt-0 shadow-none">
			<LyricHeader
				showPreview={showPreview}
				setShowPreview={setShowPreview}
				hasEmptyLyricLines={hasEmptyLyricLines}
				lyricLines={lyricLines}
				onShowExternalLyrics={() =>
					setShowExternalLyrics(!showExternalLyrics)
				}
				showExternalLyrics={showExternalLyrics}
			/>

			<CardContent className="p-6">
				{lyricLines.length === 0 ? (
					<EmptyLyrics onAddLine={() => onAddLine()} />
				) : (
					<LyricList
						lyricLines={lyricLines}
						onUpdateLine={onUpdateLine}
						onDeleteLine={onDeleteLine}
						onSetCurrentTime={onSetCurrentTime}
						onAddLine={() => onAddLine()}
					/>
				)}
			</CardContent>
		</Card>
	);
}
