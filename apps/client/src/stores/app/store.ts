import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LyricLine } from '@/components/lyric-studio/lyric-line-item';
import { formatLRCTimestamp } from '@/lib/utils';
import type { PlayerRef } from '@remotion/player';
import type { ComponentRef, RefObject } from 'react';

// Keep original types for compatibility
export interface LRCData {
	metadata: {
		title: string;
		artist: string;
		album: string;
		timestamps: {
			time: string;
			text: string;
		}[];
	};
}

interface AppState {
	// State properties
	trackLoaded: boolean;
	projectId?: string;
	lyricLines: LyricLine[];
	externalLyrics: string;
	showPreview: boolean;
	showExternalLyrics: boolean;
	showVideoPreview: boolean;
}

interface AppActions {
	// Basic setters
	setTrackLoaded: (loaded: boolean) => void;
	updateProjectId: (id?: string) => void;
	setLyricLines: (lines: LyricLine[]) => void;
	setExternalLyrics: (lyrics: string) => void;
	setShowPreview: (show: boolean) => void;
	setShowExternalLyrics: (show: boolean) => void;
	setShowVideoPreview: (show: boolean) => void;

	// Complex actions
	jumpToLyricLine: (params: {
		id: number;
		audioRef: RefObject<ComponentRef<'audio'> | null>;
		videoRef?: RefObject<PlayerRef | null>;
	}) => void;
	addLyricLine: (params?: {
		afterId?: number;
		audioRef: RefObject<ComponentRef<'audio'> | null>;
	}) => void;
	updateLyricLine: (id: number, data: Partial<LyricLine>) => void;
	deleteLyricLine: (id: number) => void;
	addLinesFromExternal: (externalLines: string[]) => void;
	setVideoTime: (params: {
		timestamp: number;
		videoRef?: RefObject<PlayerRef | null>;
	}) => void;
	resetAllStatesAndPlayers: () => void;

	// Toggle actions
	toggleShowExternalLyrics: () => void;
	toggleShowVideoPreview: () => void;
	toggleShowPreview: () => void;

	// Utility methods
	areLyricLinesWithoutTimestamps: () => boolean;
	isLyricLinesInOrder: () => boolean;
	isValidLyricLines: () => boolean;
	generateLRC: () => LRCData;
	handleDownload: () => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
	devtools(
		(set, get) => ({
			// Initial state
			trackLoaded: false,
			projectId: undefined,
			lyricLines: [],
			externalLyrics: '',
			showPreview: false,
			showExternalLyrics: false,
			showVideoPreview: false,

			// Basic setters
			setTrackLoaded: (loaded) => set({ trackLoaded: loaded }),

			updateProjectId: (id) => set({ projectId: id }),

			setLyricLines: (lines) => set({ lyricLines: lines }),

			setExternalLyrics: (lyrics) => set({ externalLyrics: lyrics }),

			setShowPreview: (show) => set({ showPreview: show }),

			setShowExternalLyrics: (show) => set({ showExternalLyrics: show }),

			setShowVideoPreview: (show) => set({ showVideoPreview: show }),

			// Utility methods
			areLyricLinesWithoutTimestamps: () => {
				const { lyricLines } = get();
				return lyricLines.every((line) => line.timestamp === 0);
			},

			isLyricLinesInOrder: () => {
				const { lyricLines } = get();
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
			},

			isValidLyricLines: () => {
				const { lyricLines } = get();
				return lyricLines.some(
					(line) =>
						line.text.trim() !== '' && line.timestamp !== undefined
				);
			},

			// Toggle actions
			toggleShowExternalLyrics: () =>
				set((state) => ({
					showExternalLyrics: !state.showExternalLyrics,
					showPreview: false,
					showVideoPreview: false,
				})),

			toggleShowVideoPreview: () =>
				set((state) => ({
					showVideoPreview: !state.showVideoPreview,
					showPreview: false,
					showExternalLyrics: false,
				})),

			toggleShowPreview: () =>
				set((state) => ({
					showPreview: !state.showPreview,
					showExternalLyrics: false,
					showVideoPreview: false,
				})),

			// Complex actions
			jumpToLyricLine: (params) => {
				const { id, audioRef, videoRef } = params;
				const { lyricLines } = get();
				const line = lyricLines.find((line) => line.id === id);
				if (line?.timestamp !== undefined && audioRef?.current) {
					audioRef.current.currentTime = line.timestamp;
					audioRef.current
						.play()
						.catch((err) => console.error('Playback failed:', err));
					get().setVideoTime({ timestamp: line.timestamp, videoRef });
				}
			},

			setVideoTime: (params) => {
				const { timestamp, videoRef } = params;
				if (videoRef?.current) {
					const fps = 30;
					const frame = Math.floor(timestamp * fps);
					videoRef.current.seekTo(frame);
				}
			},

			// TODO: no audioRef in context
			addLyricLine: (params) => {
				const { afterId, audioRef } = params || {};
				const { lyricLines } = get();
				const newId =
					Math.max(0, ...lyricLines.map((line) => line.id)) + 1;
				const currentTimestamp = audioRef?.current?.currentTime || 0;

				if (afterId) {
					const index = lyricLines.findIndex(
						(line) => line.id === afterId
					);
					const newLines = [...lyricLines];

					let newTimestamp = currentTimestamp;
					const prevTimestamp = newLines[index]?.timestamp || 0;
					const nextTimestamp =
						index < newLines.length - 1
							? newLines[index + 1].timestamp
							: Infinity;

					if (
						prevTimestamp !== undefined &&
						newTimestamp <= prevTimestamp
					) {
						newTimestamp = prevTimestamp + 0.5;
					}
					if (
						nextTimestamp !== undefined &&
						nextTimestamp !== Infinity &&
						newTimestamp >= nextTimestamp
					) {
						newTimestamp = (prevTimestamp + nextTimestamp) / 2;
					}

					newLines.splice(index + 1, 0, {
						id: newId,
						text: '',
						timestamp: newTimestamp,
					});
					set({ lyricLines: newLines });
				} else {
					let newTimestamp = currentTimestamp;
					if (lyricLines.length > 0) {
						const lastTimestamp =
							lyricLines[lyricLines.length - 1].timestamp;
						if (
							lastTimestamp !== undefined &&
							newTimestamp <= lastTimestamp
						) {
							newTimestamp = lastTimestamp + 0.5;
						}
					}

					set({
						lyricLines: [
							...lyricLines,
							{ id: newId, text: '', timestamp: newTimestamp },
						],
					});
				}
			},

			updateLyricLine: (id, data) => {
				const { lyricLines } = get();
				set({
					lyricLines: lyricLines.map((line) =>
						line.id === id ? { ...line, ...data } : line
					),
				});
			},

			deleteLyricLine: (id) => {
				const { lyricLines } = get();
				set({
					lyricLines: lyricLines.filter((line) => line.id !== id),
				});
			},
			addLinesFromExternal: (externalLines) => {
				if (externalLines.length === 0) return;

				const { lyricLines } = get();
				const newLines = externalLines.map((text, index) => {
					const newId =
						Math.max(0, ...lyricLines.map((line) => line.id)) +
						index +
						1;
					return {
						id: newId,
						text,
						timestamp: undefined,
					};
				});

				set({ lyricLines: newLines });
			},

			generateLRC: () => {
				const { lyricLines } = get();
				const sortedLyrics = [...lyricLines].sort(
					(a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
				);

				return {
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
			},

			handleDownload: () => {
				const lrcData = get().generateLRC();

				let lrcContent = `[ti:${lrcData.metadata.title}]\n`;
				lrcContent += `[ar:${lrcData.metadata.artist}]\n`;
				lrcContent += `[al:${lrcData.metadata.album}]\n\n`;

				lrcData.metadata.timestamps.forEach(({ time, text }) => {
					lrcContent += `[${time}]${text}\n`;
				});

				const blob = new Blob([lrcContent], { type: 'text/plain' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'lyrics.lrc';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			},

			resetAllStatesAndPlayers: () => {
				// Reset state
				set({
					trackLoaded: false,
					lyricLines: [],
					externalLyrics: '',
					showPreview: false,
					showExternalLyrics: false,
					showVideoPreview: false,
				});
			},
		}),
		{
			name: 'app-store',
		}
	)
);
