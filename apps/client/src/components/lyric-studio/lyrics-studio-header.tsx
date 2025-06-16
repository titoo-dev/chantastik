import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';

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

	const { isMobile, isSmallMobile } = useResponsiveMobile();

	if (isMobile || isSmallMobile) {
		return (
			<div className="mb-6 space-y-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold tracking-tight leading-relaxed">
						Create Amazing Lyrics
					</h1>
					<p className="text-muted-foreground leading-relaxed text-sm">
						{trackLoaded
							? 'Create and edit lyrics for your track'
							: 'Upload an audio track to get started'}
					</p>
				</div>

				{trackLoaded && (
					<div className="flex flex-col gap-3 w-full">
						<div className="flex flex-row gap-2">
							<Button
								onClick={toggleShowVideoPreview}
								variant="outline"
								size="sm"
								className="flex-1 gap-1 min-h-[44px]"
								title="Toggle video preview"
								disabled={
									lyricLines.length === 0 ||
									!isValidLyricLines()
								}
							>
								<FileText className="h-4 w-4" />
								{showVideoPreview ? 'Hide Video' : 'Video'}
							</Button>
							<Button
								onClick={toggleShowExternalLyrics}
								variant="outline"
								size="sm"
								className="flex-1 gap-1 min-h-[44px]"
								title="Toggle external lyrics"
								disabled={showVideoPreview}
							>
								<FileText className="h-4 w-4" />
								{showExternalLyrics ? 'Hide Lyrics' : 'Lyrics'}
							</Button>
						</div>
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
							size="sm"
							className="w-full min-h-[44px]"
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
		);
	}

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
