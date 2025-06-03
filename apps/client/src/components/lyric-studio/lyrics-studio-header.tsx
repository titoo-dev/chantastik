import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app-context';

export const LyricStudioHeader = memo(() => {
	const {
		showPreview,
		setShowPreview,
		isValidLyricLines,
		lyricLines,
		showExternalLyrics,
		areLyricLinesWithoutTimestamps,
		handleDownload,
		trackLoaded,
		toggleShowExternalLyrics,
		showVideoPreview,
		toggleShowVideoPreview,
	} = useAppContext();

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
							disabled={showPreview}
						>
							<FileText className="h-4 w-4" />
							{showExternalLyrics
								? 'Hide Lyrics'
								: 'External Lyrics'}
						</Button>
						<Button
							onClick={() => setShowPreview(!showPreview)}
							variant="outline"
							className="gap-2"
							title="Toggle lyrics preview"
							disabled={
								lyricLines.length === 0 ||
								!isValidLyricLines() ||
								showExternalLyrics
							}
							aria-label="Toggle lyrics preview"
						>
							<Eye className="h-4 w-4" />
							{showPreview ? 'Hide Preview' : 'Preview'}
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
