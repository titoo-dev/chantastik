import { CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpFromLine, CloudDownload, Download, Music } from 'lucide-react';
import { memo, useRef } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app/store';
import { useSaveLyrics } from '@/hooks/use-save-lyrics';
import type { LyricLine } from '@/data/types';

export const LyricHeader = memo(function LyricHeader() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const trackLoaded = useAppStore((state) => state.trackLoaded);
	const currentProjectId = useAppStore((state) => state.projectId);
	const lyricLines = useAppStore((state) => state.lyricLines);
	const {
		areLyricLinesWithoutTimestamps,
		handleDownload,
		isValidLyricLines,
		setLyricLines,
	} = useAppStore.getState();

	const saveLyricsMutation = useSaveLyrics();

	const loadFromLrcFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleSaveLyrics = async () => {
		if (!currentProjectId) {
			toast.error('No Project Selected', {
				description: 'Please select a project before saving lyrics.',
			});
			return;
		}

		if (!lyricLines || lyricLines.length === 0) {
			toast.error('No Lyrics to Save', {
				description: 'Please add some lyrics before saving.',
			});
			return;
		}

		try {
			// Convert lyric lines to text format
			const text = lyricLines.map((line) => line.text).join('\n');

			await saveLyricsMutation.mutateAsync({
				projectId: currentProjectId,
				text,
				lines: lyricLines,
			});
		} catch (error) {
			// Error handling is done in the mutation hook
			console.error('Failed to save lyrics:', error);
		}
	};

	const handleLrcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const lines = content.split('\n');

				// Extract lyric lines with timestamps
				const parsedLyricEntries = lines
					.filter(
						(line) =>
							line.trim() &&
							line.match(/^\[\d{2}:\d{2}(\.\d+)?\]/)
					)
					.map((line, index) => {
						const match = line.match(
							/^\[(\d{2}):(\d{2})(\.\d+)?\](.*)/
						);
						if (match) {
							const minutes = parseInt(match[1], 10);
							const seconds = parseInt(match[2], 10);
							const milliseconds = match[3]
								? parseFloat(match[3])
								: 0;
							const text = match[4].trim();

							// Convert to seconds
							const timestamp =
								minutes * 60 + seconds + milliseconds;

							return {
								id: index + 1,
								text,
								timestamp,
							};
						}
						return null;
					})
					.filter(Boolean) as LyricLine[];

				if (parsedLyricEntries.length > 0) {
					setLyricLines(parsedLyricEntries);
					toast.success('LRC File Loaded', {
						description: `${parsedLyricEntries.length} lyric lines imported successfully.`,
					});
				} else {
					toast.error('Invalid LRC File', {
						description: 'No valid lyric lines found in the file.',
					});
				}
			} catch (error) {
				toast.error('Error Loading File', {
					description: 'Failed to parse the LRC file.',
				});
			}
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		};

		reader.readAsText(file);
	};

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
					<Button
						onClick={handleSaveLyrics}
						variant="default"
						className="gap-2 w-full md:w-auto"
						disabled={
							saveLyricsMutation.isPending ||
							!currentProjectId ||
							!lyricLines?.length
						}
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
