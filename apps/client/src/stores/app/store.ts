import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { formatLRCTimestamp } from '@/lib/utils';
import type { PlayerRef } from '@remotion/player';
import type { ComponentRef, RefObject } from 'react';
import type { AudioMeta, LyricLine } from '@/data/types';
import { preloadImage } from '@remotion/preload';
import { getCoverArtUrl } from '@/data/api';

// Command interface for implementing command pattern
type Command<T = any> = {
    execute: () => T
    undo?: () => void
    canExecute?: () => boolean
}

// Command history for undo functionality
type CommandHistory = {
    commands: Array<{ command: Command; timestamp: number }>
    currentIndex: number
}

// Keep original types for compatibility
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
}

type AppState = {
	// State properties
	trackLoaded: boolean;
	projectId?: string;
	audio: AudioMeta | undefined;
	lyricLines: LyricLine[];
	externalLyrics: string;
	commandHistory: CommandHistory;
}

type AppActions = {
	// Basic setters
	setTrackLoaded: (loaded: boolean) => void;
	updateProjectId: (id?: string) => void;
	setAudio: (audio: AudioMeta | undefined) => void;
	setLyricLines: (lines: LyricLine[]) => void;
	setExternalLyrics: (lyrics: string) => void;

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

	// Command pattern methods
	executeCommand: <T>(command: Command<T>) => T;
	undo: () => void;

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
			audio: undefined,
			lyricLines: [],
			externalLyrics: '',
			commandHistory: {
				commands: [],
				currentIndex: -1
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

			addLyricLine: (params) => {
				const { afterId, audioRef } = params || {};
				const { lyricLines } = get();
				const newId = Math.max(0, ...lyricLines.map((line) => line.id)) + 1;
				const currentTimestamp = audioRef?.current?.currentTime || 0;

				const command: Command = {
					execute: () => {
						if (afterId) {
							const index = lyricLines.findIndex((line) => line.id === afterId);
							const newLines = [...lyricLines];

							let newTimestamp = currentTimestamp;
							const prevTimestamp = newLines[index]?.timestamp || 0;
							const nextTimestamp = index < newLines.length - 1 ? newLines[index + 1].timestamp : Infinity;

							if (prevTimestamp !== undefined && newTimestamp <= prevTimestamp) {
								newTimestamp = prevTimestamp + 0.5;
							}
							if (nextTimestamp !== undefined && nextTimestamp !== Infinity && newTimestamp >= nextTimestamp) {
								newTimestamp = (prevTimestamp + nextTimestamp) / 2;
							}

							newLines.splice(index + 1, 0, {
								id: newId,
								text: '',
								timestamp: newTimestamp,
							});
							set({ lyricLines: newLines });
							return newLines;
						} else {
							let newTimestamp = currentTimestamp;
							if (lyricLines.length > 0) {
								const lastTimestamp = lyricLines[lyricLines.length - 1].timestamp;
								if (lastTimestamp !== undefined && newTimestamp <= lastTimestamp) {
									newTimestamp = lastTimestamp + 0.5;
								}
							}

							const newLines = [
								...lyricLines,
								{ id: newId, text: '', timestamp: newTimestamp },
							];
							set({ lyricLines: newLines });
							return newLines;
						}
					},
					undo: () => {
						set({ lyricLines });
					}
				};

				get().executeCommand(command);
			},

			updateLyricLine: (id, data) => {
				const { lyricLines } = get();
				const oldLine = lyricLines.find(line => line.id === id);
				
				if (!oldLine) return;

				const command: Command = {
					execute: () => {
						const newLines = lyricLines.map((line) =>
							line.id === id ? { ...line, ...data } : line
						);
						set({ lyricLines: newLines });
						return newLines;
					},
					undo: () => {
						const restoredLines = lyricLines.map((line) =>
							line.id === id ? oldLine : line
						);
						set({ lyricLines: restoredLines });
					}
				};

				get().executeCommand(command);
			},

			deleteLyricLine: (id) => {
				const { lyricLines } = get();
				const lineToDelete = lyricLines.find(line => line.id === id);
				const lineIndex = lyricLines.findIndex(line => line.id === id);
				
				if (!lineToDelete || lineIndex === -1) return;

				const command: Command = {
					execute: () => {
						const newLines = lyricLines.filter((line) => line.id !== id);
						set({ lyricLines: newLines });
						return newLines;
					},
					undo: () => {
						const restoredLines = [...lyricLines];
						restoredLines.splice(lineIndex, 0, lineToDelete);
						set({ lyricLines: restoredLines });
					}
				};

				get().executeCommand(command);
			},

			addLinesFromExternal: (externalLines) => {
				if (externalLines.length === 0) return;

				const { lyricLines } = get();
				const command: Command = {
					execute: () => {
						const newLines = externalLines.map((text, index) => {
							const newId = Math.max(0, ...lyricLines.map((line) => line.id)) + index + 1;
							return {
								id: newId,
								text,
								timestamp: undefined,
							};
						});

						const updatedLines = [...newLines];
						set({ lyricLines: updatedLines });
						return updatedLines;
					},
					undo: () => {
						set({ lyricLines });
					}
				};

				get().executeCommand(command);
			},

			// Command pattern implementation
			executeCommand: <T>(command: Command<T>): T => {
				if (command.canExecute && !command.canExecute()) {
					throw new Error('Command cannot be executed');
				}

				const result = command.execute();
				
				// Add to command history if undo is supported
				if (command.undo) {
					set((state) => {
						const newCommands = [
							...state.commandHistory.commands.slice(0, state.commandHistory.currentIndex + 1),
							{ command, timestamp: Date.now() }
						];
						return {
							commandHistory: {
								commands: newCommands,
								currentIndex: newCommands.length - 1
							}
						};
					});
				}

				return result;
			},

			undo: () => {
				const { commandHistory } = get();
				if (commandHistory.currentIndex >= 0) {
					const { command } = commandHistory.commands[commandHistory.currentIndex];
					if (command.undo) {
						command.undo();
						set((state) => ({
							commandHistory: {
								...state.commandHistory,
								currentIndex: state.commandHistory.currentIndex - 1
							}
						}));
					}
				}
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
					audio: undefined,
					commandHistory: {
						commands: [],
						currentIndex: -1
					}
				});
			},
		}),
		{
			name: 'app-store',
		}
	)
);

// Selector hooks for better performance
export const useAppLyricLines = () => useAppStore((state) => state.lyricLines);
export const useAppAudio = () => useAppStore((state) => state.audio);
export const useAppTrackLoaded = () => useAppStore((state) => state.trackLoaded);
export const useAppProjectId = () => useAppStore((state) => state.projectId);
export const useAppExternalLyrics = () => useAppStore((state) => state.externalLyrics);
export const useAppCommandHistory = () => useAppStore((state) => state.commandHistory);
export const useAppActions = () => useAppStore((state) => ({
	addLyricLine: state.addLyricLine,
	updateLyricLine: state.updateLyricLine,
	deleteLyricLine: state.deleteLyricLine,
	addLinesFromExternal: state.addLinesFromExternal,
	undo: state.undo,
	setTrackLoaded: state.setTrackLoaded,
	setAudio: state.setAudio,
	setLyricLines: state.setLyricLines,
	setExternalLyrics: state.setExternalLyrics,
	jumpToLyricLine: state.jumpToLyricLine,
	resetAllStatesAndPlayers: state.resetAllStatesAndPlayers,
}));
