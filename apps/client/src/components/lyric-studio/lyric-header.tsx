import { CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpFromLine, CloudDownload, Download, Music } from 'lucide-react';
import { memo } from 'react';
import { useAppStore } from '@/stores/app/store';
import { useSaveLyricsHandler } from '@/hooks/use-save-lyrics-handler';
import { useLrcFileHandler } from '@/hooks/use-lrc-file-handler';

export const LyricHeader = memo(function LyricHeader() {
	const trackLoaded = useAppStore((state) => state.trackLoaded);
	const currentProjectId = useAppStore((state) => state.projectId);
	const lyricLines = useAppStore((state) => state.lyricLines);
	const {
		areLyricLinesWithoutTimestamps,
		handleDownload,
		isValidLyricLines,
	} = useAppStore.getState();

	const { handleSaveLyrics, saveLyricsMutation } = useSaveLyricsHandler();
	const { loadFromLrcFile, fileInputRef, handleLrcFileChange } =
		useLrcFileHandler();

	const downloadLrcButtonDisabled =
		!isValidLyricLines() ||
		lyricLines.length === 0 ||
		areLyricLinesWithoutTimestamps();

	const isSaveLyricsButtonDisabled =
		saveLyricsMutation.isPending ||
		!currentProjectId ||
		!lyricLines?.length;

	if (!trackLoaded) {
		return null;
	}

	return (
		<CardHeader className="p-4 border-b">
			<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
				<CardTitle className="flex items-center gap-2 min-w-0">
					<Music className="h-5 w-5 text-primary flex-shrink-0" />
					<span className="truncate">Lyric Editor</span>
				</CardTitle>
				<div className="flex flex-col md:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept=".lrc,.txt"
						onChange={handleLrcFileChange}
					/>
					<Button
						onClick={loadFromLrcFile}
						variant="outline"
						className="gap-2 w-full md:w-auto"
						title="Import lyrics from LRC file"
					>
						<ArrowUpFromLine className="h-4 w-4" />
						Load from LRC
					</Button>
					<Button
						onClick={handleDownload}
						disabled={downloadLrcButtonDisabled}
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
					<Button
						onClick={handleSaveLyrics}
						variant="default"
						className="gap-2 w-full md:w-auto"
						disabled={isSaveLyricsButtonDisabled}
						title="Save lyrics to project"
					>
						<CloudDownload className="h-4 w-4" />
						{saveLyricsMutation.isPending
							? 'Saving...'
							: 'Save Lyrics'}
					</Button>
				</div>
			</div>
		</CardHeader>
	);
});
