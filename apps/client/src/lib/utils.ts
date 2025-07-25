import type { LyricLine } from '@/data/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export const isValidYoutubeUrl = (url: string): boolean => {
	const regExp =
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
	return regExp.test(url);
};

export const extractVideoId = (url: string): string | null => {
	const regExp =
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
	const match = url.match(regExp);
	return match ? match[1] : null;
};

export const formatTimestamp = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
		.toFixed(2)
		.padStart(5, '0')}`;
};

export const formatLRCTimestamp = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
		.toFixed(2)
		.padStart(5, '0')}`;
};

export const formatPlayerTime = (time: number) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const createTimestampSetter = (
	audioRef: React.RefObject<HTMLAudioElement | null>,
	updateLyricLine: (id: number, updates: Partial<LyricLine>) => void
) => {
	return (id: number) => {
		if (audioRef?.current) {
			const newTimestamp = audioRef.current.currentTime;
			updateLyricLine(id, { timestamp: newTimestamp });
		}
	};
};

export const createLineAdder = (
	addLyricLine: (options?: {
		afterId?: number;
		audioRef: React.RefObject<HTMLAudioElement | null>;
	}) => void,
	audioRef: React.RefObject<HTMLAudioElement | null>
) => {
	return (afterId: number) => {
		addLyricLine({
			afterId,
			audioRef,
		});
	};
};

/**
 * Parse YouTube duration from ISO 8601 format (PT4M13S) to readable format (4:13)
 */
export const parseYouTubeDuration = (duration: string): string => {
	if (!duration) return '0:00';
	
	// Parse ISO 8601 duration format (PT4M13S)
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return '0:00';
	
	const hours = parseInt(match[1] || '0', 10);
	const minutes = parseInt(match[2] || '0', 10);
	const seconds = parseInt(match[3] || '0', 10);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	}

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
