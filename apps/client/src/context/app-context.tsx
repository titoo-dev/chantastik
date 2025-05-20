import type { LyricLine } from '@/components/lyric-studio/lyric-line-item';
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
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<ComponentRef<'audio'>>(null);
	const [externalLyrics, setExternalLyrics] = useState<string>('');
	const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
	const [trackLoaded, setTrackLoaded] = useState(false);

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
			}}
		>
			{children}
		</AppContext.Provider>
	);
}
