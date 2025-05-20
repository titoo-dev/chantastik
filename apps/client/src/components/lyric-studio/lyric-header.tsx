import { Download, Eye, Music, FileText } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/card';
import type { LyricLine } from './lyric-line-item';
import { Button } from '../ui/button';
import { useAppContext } from '@/hooks/use-app-context';
import { formatLRCTimestamp } from '@/lib/utils';
import { useCallback } from 'react';

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

export function LyricHeader({
	showPreview,
	setShowPreview,
	hasEmptyLyricLines,
	lyricLines,
	onShowExternalLyrics,
	showExternalLyrics,
}: {
	showPreview: boolean;
	setShowPreview: (show: boolean) => void;
	hasEmptyLyricLines: () => boolean;
	lyricLines: LyricLine[];
	showExternalLyrics: boolean;
	onShowExternalLyrics: () => void;
}) {
	const { areLyricLinesWithoutTimestamps } = useAppContext();

	const generateLRC = useCallback(() => {
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

		console.log('LRC Data (JSON format):', lrcData);
		return lrcData;
	}, [lyricLines]);

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
		<CardHeader className="flex flex-row items-center justify-between py-8 border-b">
			<CardTitle className="flex items-center gap-2">
				<Music className="h-5 w-5 text-primary" />
				Lyric Editor
			</CardTitle>
			<div className="flex items-center gap-3">
				<Button
					onClick={onShowExternalLyrics}
					variant="outline"
					className="gap-2"
					title="Import lyrics from text"
					disabled={showPreview}
				>
					<FileText className="h-4 w-4" />
					{showExternalLyrics ? 'Hide Lyrics' : 'External Lyrics'}
				</Button>
				<Button
					onClick={() => setShowPreview(!showPreview)}
					variant="outline"
					className="gap-2"
					title="Toggle lyrics preview"
					disabled={
						lyricLines.length === 0 ||
						hasEmptyLyricLines() ||
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
						hasEmptyLyricLines() ||
						lyricLines.length === 0 ||
						areLyricLinesWithoutTimestamps()
					}
					variant={
						hasEmptyLyricLines() || lyricLines.length === 0
							? 'outline'
							: 'default'
					}
					title={
						hasEmptyLyricLines()
							? 'Fill in all lyric lines before downloading'
							: 'Download lyrics in LRC format'
					}
				>
					<Download className="mr-2 h-4 w-4" />
					Download
				</Button>
			</div>
		</CardHeader>
	);
}
