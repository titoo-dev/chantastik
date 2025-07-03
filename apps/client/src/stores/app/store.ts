import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { formatLRCTimestamp } from '@/lib/utils';
import type { PlayerRef } from '@remotion/player';
import type { ComponentRef, RefObject } from 'react';
import type { AudioMeta, LyricLine } from '@/data/types';
import { preloadImage } from '@remotion/preload';
import { getCoverArtUrl } from '@/data/api';

export type LRCData = {
	metadata: {
		title: string;
		artist: string;
		album: string;
		timestamps: {
			time: string;
			text: string;
		}[];
	};
};

type AppState = {
	trackLoaded: boolean;
	projectId?: string;
	audio: AudioMeta | undefined;
	lyricLines: LyricLine[];
	externalLyrics: string;
};

type AppActions = {
	setTrackLoaded: (loaded: boolean) => void;
	updateProjectId: (id?: string) => void;
	setAudio: (audio: AudioMeta | undefined) => void;
	setLyricLines: (lines: LyricLine[]) => void;
	setExternalLyrics: (lyrics: string) => void;

	jumpToLyricLine: (params: {
		id: number;
		audioRef: RefObject<ComponentRef<'audio'> | null>;
		videoRef?: RefObject<PlayerRef | null>;
	}) => void;
	addLinesFromExternal: (externalLines: string[]) => void;
	setVideoTime: (params: {
		timestamp: number;
		videoRef?: RefObject<PlayerRef | null>;
	}) => void;
	resetAllStatesAndPlayers: () => void;

	areLyricLinesWithoutTimestamps: () => boolean;
	isLyricLinesInOrder: () => boolean;
	isValidLyricLines: () => boolean;
	generateLRC: () => LRCData;
	handleDownload: () => void;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
	devtools(
		(set, get) => ({
			// Initial state
			trackLoaded: false,
			projectId: undefined,
			audio: undefined,
			lyricLines: [],
			externalLyrics: '',
			commandHistory: {
				commands: [],
				currentIndex: -1,
			},

			// Basic setters
			setTrackLoaded: (loaded) => set({ trackLoaded: loaded }),

			updateProjectId: (id) => set({ projectId: id }),

			setAudio: (audio) => {
				set({ audio });
				// Preload cover art when audio changes
				if (audio) {
					preloadImage(getCoverArtUrl(audio.id));
				}
			},

			setLyricLines: (lines) => set({ lyricLines: lines }),

			setExternalLyrics: (lyrics) => set({ externalLyrics: lyrics }),

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

				const updatedLines = [...newLines];
				set({ lyricLines: updatedLines });
			},

			generateLRC: () => {
				const { lyricLines, audio } = get();
				const sortedLyrics = [...lyricLines].sort(
					(a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
				);

				const getMetadataFromStorage = () => {
					if (!audio) return null;

					try {
						const storedAudioMetadata =
							localStorage.getItem(`currentAudioMetadata`);
						if (!storedAudioMetadata) return null;

						const audioMetadata: AudioMeta =
							JSON.parse(storedAudioMetadata);
						return audioMetadata.metadata?.title ||
							audioMetadata.metadata?.artist ||
							audioMetadata.metadata?.album
							? audioMetadata.metadata
							: null;
					} catch (error) {
						console.warn(
							'Failed to parse stored audio metadata:',
							error
						);
						return null;
					}
				};

				const createTimestamps = () =>
					sortedLyrics.map((line) => ({
						time: formatLRCTimestamp(line?.timestamp ?? 0),
						text: line.text,
					}));

				const storedMetadata = getMetadataFromStorage();
				const defaultMetadata = {
					title: 'Untitled Song',
					artist: 'Unknown Artist',
					album: 'Unknown Album',
				};

				return {
					metadata: {
						...defaultMetadata,
						...storedMetadata,
						timestamps: createTimestamps(),
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
				a.download = `${lrcData.metadata.title || 'unknown'} - ${lrcData.metadata.artist || ''}.lrc`;
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
					projectId: undefined,
					audio: undefined
				});
			},
		}),
		{
			name: 'app-store',
		}
	)
);

