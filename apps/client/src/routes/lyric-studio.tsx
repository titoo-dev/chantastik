import { createFileRoute } from '@tanstack/react-router';
import { TrackUploadWrapper } from '@/components/track-upload-wrapper';
import { useState, memo } from 'react';
import { type LyricLine } from '@/components/lyric-studio/lyric-line-item';
import { LyricEditor } from '@/components/lyric-studio/lyric-editor';
import { LyricPreviewSection } from '@/components/lyric-studio/lyric-preview-section';
import { ExternalLyricsSection } from '@/components/lyric-studio/external-lyrics-section';
import { useAppContext } from '@/hooks/use-app-context';

export const Route = createFileRoute('/lyric-studio')({
	component: LyricStudioPage,
});

function LyricStudioPage() {
	const [showPreview, setShowPreview] = useState(false);
	const [showExternalLyrics, setShowExternalLyrics] = useState(false);
	const { audioRef, trackLoaded, lyricLines, setLyricLines } =
		useAppContext();

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

	const updateLyricLine = (id: number, data: Partial<LyricLine>) => {
		setLyricLines(
			lyricLines.map((line) =>
				line.id === id ? { ...line, ...data } : line
			)
		);
	};

	const deleteLyricLine = (id: number) => {
		setLyricLines(lyricLines.filter((line) => line.id !== id));
	};

	const setCurrentTimeAsTimestamp = (id: number) => {
		if (audioRef.current) {
			const newTimestamp = audioRef.current.currentTime;

			updateLyricLine(id, { timestamp: newTimestamp });
		}
	};

	// Check if all lyric lines have text
	const hasEmptyLyricLines = (): boolean => {
		return lyricLines.some((line) => line.text.trim() === '');
	};

	// Function to add multiple lines from external lyrics
	const addLinesFromExternal = (externalLines: string[]) => {
		if (externalLines.length === 0) return;

		// Create a new lyric line for each external line with incremental timestamps
		const newLines = externalLines.map((text, index) => {
			const newId =
				Math.max(0, ...lyricLines.map((line) => line.id)) + index + 1;
			// Add 2 seconds between each line
			return {
				id: newId,
				text,
				timestamp: undefined,
			};
		});

		setLyricLines(newLines);
	};

	return (
		<main className="container relative min-h-screen py-6">
			<LyricStudioHeader trackLoaded={trackLoaded} />

			{/* Main content area */}
			<div
				className="grid gap-6"
				style={{
					gridTemplateColumns:
						showPreview || showExternalLyrics ? '1fr 1fr' : '1fr',
				}}
			>
				<LyricEditor
					lyricLines={lyricLines}
					showPreview={showPreview}
					setShowPreview={setShowPreview}
					hasEmptyLyricLines={hasEmptyLyricLines}
					onUpdateLine={updateLyricLine}
					onDeleteLine={deleteLyricLine}
					onSetCurrentTime={setCurrentTimeAsTimestamp}
					onAddLine={addLyricLine}
					showExternalLyrics={showExternalLyrics}
					setShowExternalLyrics={setShowExternalLyrics}
				/>

				{/* Lyrics preview or external lyrics section */}
				{showPreview && !showExternalLyrics && <LyricPreviewSection />}

				{/* External lyrics input */}
				{showExternalLyrics && (
					<ExternalLyricsSection
						onConvertToLines={addLinesFromExternal}
					/>
				)}
			</div>

			{/* Spacer for fixed player */}
			<div className="h-58"></div>

			{/* Floating track player with integrated timestamp */}
			<div className="fixed bottom-6 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 transform">
				<TrackUploadWrapper
					iconColor="text-blue-500"
					showDownload={false}
					audioRef={audioRef}
				/>
			</div>
		</main>
	);
}

interface LyricStudioHeaderProps {
	trackLoaded: boolean;
}

const LyricStudioHeader = memo(({ trackLoaded }: LyricStudioHeaderProps) => {
	return (
		<div className="mb-6 space-y-2">
			<h1 className="text-3xl font-bold tracking-tight leading-relaxed">
				Lyric Studio
			</h1>
			<p className="text-muted-foreground leading-relaxed">
				{trackLoaded
					? 'Create and edit lyrics for your track'
					: 'Upload an audio track to get started'}
			</p>
		</div>
	);
});
