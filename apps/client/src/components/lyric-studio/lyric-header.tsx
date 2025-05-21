import { CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpFromLine, Music } from 'lucide-react';
import { memo, useRef } from 'react';
import { useAppContext } from '@/hooks/use-app-context';
import { toast } from 'sonner';
import type { LyricLine } from './lyric-line-item';

export const LyricHeader = memo(function LyricHeader() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setLyricLines } = useAppContext();

	const loadFromLrcFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
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
				const lyricLines = lines
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

				if (lyricLines.length > 0) {
					setLyricLines(lyricLines);
					toast.success('LRC File Loaded', {
						description: `${lyricLines.length} lyric lines imported successfully.`,
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

	return (
		<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
			<CardTitle className="flex items-center gap-2">
				<Music className="h-5 w-5 text-primary" />
				Lyric Editor
			</CardTitle>
			<div className="flex items-center gap-3">
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
					className="gap-2"
					title="Import lyrics from LRC file"
				>
					<ArrowUpFromLine className="h-4 w-4" />
					Load from LRC
				</Button>
			</div>
		</CardHeader>
	);
});
