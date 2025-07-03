import type { LyricLine } from '@/data/types';
import { createTimestampSetter } from '@/lib/utils';
import { useEffect, useState, type ComponentRef, type RefObject } from 'react';
import { useAudioRefContext } from './use-audio-ref-context';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';

type Command<T = any> = {
	execute: () => T;
	undo?: () => void;
	canExecute?: () => boolean;
};

type CommandHistory = {
	commands: Array<{ command: Command; timestamp: number }>;
	currentIndex: number;
};

export const useLyricEditor = () => {
    const { audioRef } = useAudioRefContext();
    
    const { trackLoaded, projectId, lyricLines } = useAppStore(
		useShallow((state) => ({
			trackLoaded: state.trackLoaded,
			projectId: state.projectId,
			lyricLines: state.lyricLines,
		}))
	);

	const [editorLines, setLyricLines] = useState<LyricLine[]>(
		() => lyricLines
	);
	// command history state
	const [commandHistory, setCommandHistory] = useState<CommandHistory>({
		commands: [],
		currentIndex: -1,
    });
    
    useEffect(() => {
        setLyricLines(lyricLines);
    }, [lyricLines]);

	const addLyricLine = (params?: {
		afterId?: number;
		audioRef: RefObject<ComponentRef<'audio'> | null>;
	}): void => {
		const { afterId, audioRef } = params || {};
		const newId = Math.max(0, ...editorLines.map((line) => line.id)) + 1;
		const currentTimestamp = audioRef?.current?.currentTime || 0;

		const command: Command = {
			execute: () => {
				if (afterId) {
					const index = editorLines.findIndex(
						(line) => line.id === afterId
					);
					const newLines = [...editorLines];

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
					setLyricLines(newLines);
					return newLines;
				} else {
					let newTimestamp = currentTimestamp;
					if (editorLines.length > 0) {
						const lastTimestamp =
							editorLines[editorLines.length - 1].timestamp;
						if (
							lastTimestamp !== undefined &&
							newTimestamp <= lastTimestamp
						) {
							newTimestamp = lastTimestamp + 0.5;
						}
					}

					const newLines = [
						...editorLines,
						{
							id: newId,
							text: '',
							timestamp: newTimestamp,
						},
					];
					setLyricLines(newLines);
					return newLines;
				}
			},
			undo: () => {
				setLyricLines(editorLines);
			},
		};

		executeCommand(command);
	};

	const updateLyricLine = (id: number, data: Partial<LyricLine>): void => {
		const oldLine = editorLines.find((line) => line.id === id);

		if (!oldLine) return;

		const command: Command = {
			execute: () => {
				const newLines = editorLines.map((line) =>
					line.id === id ? { ...line, ...data } : line
				);
				setLyricLines(newLines);
				return newLines;
			},
			undo: () => {
				const restoredLines = editorLines.map((line) =>
					line.id === id ? oldLine : line
				);
				setLyricLines(restoredLines);
			},
		};

		executeCommand(command);
	};

	const deleteLyricLine = (id: number): void => {
		const lineToDelete = editorLines.find((line) => line.id === id);
		const lineIndex = editorLines.findIndex((line) => line.id === id);

		if (!lineToDelete || lineIndex === -1) return;

		const command: Command = {
			execute: () => {
				const newLines = editorLines.filter((line) => line.id !== id);
				setLyricLines(newLines);
				return newLines;
			},
			undo: () => {
				setLyricLines(editorLines);
			},
		};

		executeCommand(command);
	};

	const executeCommand = <T>(command: Command<T>): T => {
		if (command.canExecute && !command.canExecute()) {
			throw new Error('Command cannot be executed');
		}

		const result = command.execute();

		// Add to command history if undo is supported
		if (command.undo) {
			setCommandHistory((prev) => {
				const newCommands = [
					...prev.commands.slice(0, prev.currentIndex + 1),
					{ command, timestamp: Date.now() },
				];

				return {
					commands: newCommands,
					currentIndex: newCommands.length - 1,
				};
			});
		}

		return result;
    };
    
    const undo = (): void => {
		if (commandHistory.currentIndex >= 0) {
			const { command } =
				commandHistory.commands[commandHistory.currentIndex];
			if (command.undo) {
				command.undo();
				setCommandHistory((prev) => ({
					...prev,
					currentIndex: prev.currentIndex - 1,
				}));
			}
		}
    }
     

	const setCurrentTimeAsTimestamp = createTimestampSetter(
		audioRef,
		updateLyricLine
    );
    
    return {
		audioRef,
		editorLines,
		setCurrentTimeAsTimestamp,
		undo,
		addLyricLine,
		updateLyricLine,
		deleteLyricLine,
		commandHistory,
		projectId,
		trackLoaded,
	};
};
