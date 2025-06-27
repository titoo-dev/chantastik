import type { LyricLine } from '@/data/types';
import { useAppStore } from '@/stores/app/store';
import { useRef } from 'react';
import { toast } from 'sonner';

export const useLrcFileHandler = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setLyricLines } = useAppStore.getState();

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

	return {
		loadFromLrcFile,
		fileInputRef,
		handleLrcFileChange,
	};
};
