import type { LyricLine } from '@/components/lyric-studio/lyric-line-item';
import { formatLRCTimestamp } from '@/lib/utils';
import {
	createContext,
	useRef,
	useState,
	type ComponentRef,
	type ReactNode,
	type RefObject,
} from 'react';

type AppContextType = {
	trackLoaded: boolean;
	setTrackLoaded: (loaded: boolean) => void;
	audioRef: RefObject<ComponentRef<'audio'> | null>;
	jumpToLyricLine: (id: number) => void;
	lyricLines: LyricLine[];
	setLyricLines: (lines: LyricLine[]) => void;
	externalLyrics: string;
	setExternalLyrics: (lyrics: string) => void;
	areLyricLinesWithoutTimestamps: () => boolean;
	isLyricLinesInOrder: () => boolean;
	showPreview: boolean;
	setShowPreview: (show: boolean) => void;
	showExternalLyrics: boolean;
	setShowExternalLyrics: (show: boolean) => void;
	addLyricLine: (afterId?: number) => void;
	updateLyricLine: (id: number, data: Partial<LyricLine>) => void;
	deleteLyricLine: (id: number) => void;
	setCurrentTimeAsTimestamp: (id: number) => void;
	isValidLyricLines: () => boolean;
	addLinesFromExternal: (externalLines: string[]) => void;
	// Added from lyric-header
	generateLRC: () => LRCData;
	handleDownload: () => void;
	toggleShowExternalLyrics: () => void;
};

// Added from lyric-header
interface LyricMetadata {
	title: string;
	artist: string;
	album: string;
	timestamps: {
		time: string;
		text: string;
	}[];
}

export interface LRCData {
	metadata: LyricMetadata;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<ComponentRef<'audio'>>(null);
	const [externalLyrics, setExternalLyrics] = useState<string>('');
	const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
	const [trackLoaded, setTrackLoaded] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [showExternalLyrics, setShowExternalLyrics] = useState(false);

	// check if all lyrics line timestamps are 0
	const areLyricLinesWithoutTimestamps = () => {
		return lyricLines.every((line) => line.timestamp === 0);
	};

	// check if all lyrics line timestamps are ascending order
	const isLyricLinesInOrder = () => {
		if (lyricLines.length <= 1) return true;

		for (let i = 1; i < lyricLines.length; i++) {
			const currentLine = lyricLines[i];
			const previousLine = lyricLines[i - 1];

			if (
				currentLine?.timestamp !== undefined &&
				previousLine?.timestamp !== undefined &&
				currentLine.timestamp <= previousLine.timestamp
			) {
				return false;
			}
		}
		return true;
	};

	// toggle show external lyrics
	const toggleShowExternalLyrics = () => {
		setShowExternalLyrics((prev) => !prev);
	};

	// Jump to timestamp of specific lyric line
	const jumpToLyricLine = (id: number) => {
		const line = lyricLines.find((line) => line.id === id);
		if (line?.timestamp !== undefined && audioRef.current) {
			audioRef.current.currentTime = line.timestamp;
			audioRef.current
				.play()
				.catch((err) => console.error('Playback failed:', err));
		}
	};

	// Add a new lyric line
	const addLyricLine = (afterId?: number) => {
		const newId = Math.max(0, ...lyricLines.map((line) => line.id)) + 1;
		const currentTimestamp = audioRef.current?.currentTime || 0;

		if (afterId) {
			const index = lyricLines.findIndex((line) => line.id === afterId);
			const newLines = [...lyricLines];

			// Ensure the new timestamp follows ascending sequence
			let newTimestamp = currentTimestamp;
			const prevTimestamp = newLines[index]?.timestamp || 0;
			const nextTimestamp =
				index < newLines.length - 1
					? newLines[index + 1].timestamp
					: Infinity;

			// Make sure timestamp is between prev and next
			if (prevTimestamp !== undefined && newTimestamp <= prevTimestamp) {
				newTimestamp = prevTimestamp + 0.5; // Add a small increment
			}
			if (
				nextTimestamp !== undefined &&
				nextTimestamp !== Infinity &&
				newTimestamp >= nextTimestamp
			) {
				newTimestamp = (prevTimestamp + nextTimestamp) / 2; // Use middle point
			}

			newLines.splice(index + 1, 0, {
				id: newId,
				text: '',
				timestamp: newTimestamp,
			});
			setLyricLines(newLines);
		} else {
			// For adding at the end, make sure it's greater than the last timestamp
			let newTimestamp = currentTimestamp;
			if (lyricLines.length > 0) {
				const lastTimestamp =
					lyricLines[lyricLines.length - 1].timestamp;
				if (
					lastTimestamp !== undefined &&
					newTimestamp <= lastTimestamp
				) {
					newTimestamp = lastTimestamp + 0.5; // Add a small increment
				}
			}

			setLyricLines([
				...lyricLines,
				{ id: newId, text: '', timestamp: newTimestamp },
			]);
		}
	};

	// Update a lyric line
	const updateLyricLine = (id: number, data: Partial<LyricLine>) => {
		setLyricLines(
			lyricLines.map((line) =>
				line.id === id ? { ...line, ...data } : line
			)
		);
	};

	// Delete a lyric line
	const deleteLyricLine = (id: number) => {
		setLyricLines(lyricLines.filter((line) => line.id !== id));
	};

	// Set current audio time as timestamp for a lyric line
	const setCurrentTimeAsTimestamp = (id: number) => {
		if (audioRef.current) {
			const newTimestamp = audioRef.current.currentTime;
			updateLyricLine(id, { timestamp: newTimestamp });
		}
	};

	// Check if any lyric line is empty
	const isValidLyricLines = (): boolean => {
		return lyricLines.some(
			(line) => line.text.trim() !== '' && line.timestamp !== undefined
		);
	};

	// Add multiple lines from external lyrics
	const addLinesFromExternal = (externalLines: string[]) => {
		if (externalLines.length === 0) return;

		// Create a new lyric line for each external line with incremental timestamps
		const newLines = externalLines.map((text, index) => {
			const newId =
				Math.max(0, ...lyricLines.map((line) => line.id)) + index + 1;
			return {
				id: newId,
				text,
				timestamp: undefined,
			};
		});

		setLyricLines(newLines);
	};

	// Added from lyric-header.tsx
	const generateLRC = () => {
		// Sort lyrics by timestamp to ensure proper order
		const sortedLyrics = [...lyricLines].sort(
			(a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
		);

		const lrcData: LRCData = {
			metadata: {
				title: 'Untitled Song',
				artist: 'Unknown Artist',
				album: 'Unknown Album',
				timestamps: sortedLyrics.map((line) => ({
					time: formatLRCTimestamp(line?.timestamp ?? 0),
					text: line.text,
				})),
			},
		};

		return lrcData;
	};

	// Added from lyric-header.tsx
	const handleDownload = () => {
		const lrcData = generateLRC();

		// Generate LRC content
		let lrcContent = `[ti:${lrcData.metadata.title}]\n`;
		lrcContent += `[ar:${lrcData.metadata.artist}]\n`;
		lrcContent += `[al:${lrcData.metadata.album}]\n\n`;

		// Add timestamp lines
		lrcData.metadata.timestamps.forEach(({ time, text }) => {
			lrcContent += `[${time}]${text}\n`;
		});

		// Create and trigger download
		const blob = new Blob([lrcContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'lyrics.lrc';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<AppContext.Provider
			value={{
				audioRef,
				trackLoaded,
				setTrackLoaded,
				jumpToLyricLine,
				lyricLines,
				setLyricLines,
				externalLyrics,
				setExternalLyrics,
				areLyricLinesWithoutTimestamps,
				isLyricLinesInOrder,
				showPreview,
				setShowPreview,
				showExternalLyrics,
				setShowExternalLyrics,
				addLyricLine,
				updateLyricLine,
				deleteLyricLine,
				setCurrentTimeAsTimestamp,
				isValidLyricLines,
				addLinesFromExternal,
				// Added from lyric-header
				generateLRC,
				handleDownload,
				toggleShowExternalLyrics,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}
