import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';

export const LyricStudioHeader = memo(() => {
	const {
		areLyricLinesWithoutTimestamps,
		handleDownload,
		toggleShowExternalLyrics,
		toggleShowVideoPreview,
		isValidLyricLines,
	} = useAppStore.getState();

	const { showVideoPreview, lyricLines, showExternalLyrics, trackLoaded } =
		useAppStore(
			useShallow((state) => ({
				showVideoPreview: state.showVideoPreview,
				lyricLines: state.lyricLines,
				showExternalLyrics: state.showExternalLyrics,
				trackLoaded: state.trackLoaded,
			}))
		);

	return (
		<div className="mb-6 space-y-4">
			<div className="flex flex-row items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight leading-relaxed">
						Create Amazing Lyrics
					</h1>
					<p className="text-muted-foreground leading-relaxed">
						{trackLoaded
							? 'Create and edit lyrics for your track'
							: 'Upload an audio track to get started'}
					</p>
				</div>

				{trackLoaded && (
					<div className="flex items-center gap-3">
						<Button
							onClick={toggleShowVideoPreview}
							variant="outline"
							className="gap-2"
							title="Import lyrics from text"
							disabled={
								lyricLines.length === 0 || !isValidLyricLines()
							}
						>
							<FileText className="h-4 w-4" />
							{showVideoPreview
								? 'Hide Video Preview'
								: 'Video Preview'}
						</Button>
						<Button
							onClick={toggleShowExternalLyrics}
							variant="outline"
							className="gap-2"
							title="Import lyrics from text"
							disabled={showVideoPreview}
						>
							<FileText className="h-4 w-4" />
							{showExternalLyrics
								? 'Hide Lyrics'
								: 'External Lyrics'}
						</Button>
						<Button
							onClick={handleDownload}
							disabled={
								!isValidLyricLines() ||
								lyricLines.length === 0 ||
								areLyricLinesWithoutTimestamps()
							}
							variant={
								!isValidLyricLines() || lyricLines.length === 0
									? 'outline'
									: 'default'
							}
							title={
								!isValidLyricLines()
									? 'Fill in all lyric lines before downloading'
									: 'Download lyrics in LRC format'
							}
						>
							<Download className="h-4 w-4" />
							Download LRC
						</Button>
					</div>
				)}
			</div>
		</div>
	);
});
