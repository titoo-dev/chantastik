import { useEffect, useState, useRef } from 'react';
import { useAudioRefContext } from './use-audio-ref-context';
import { useAppStore } from '@/stores/app/store';
import { useShallow } from 'zustand/react/shallow';
import { useVideoRefContext } from './use-video-ref-context';

export function useLyricsPreviewCard() {
	const { audioRef } = useAudioRefContext();
	const { videoRef } = useVideoRefContext();

	const { jumpToLyricLine } = useAppStore.getState();

	const { lyricLines, trackLoaded } = useAppStore(
		useShallow((state) => ({
			lyricLines: state.lyricLines,
			trackLoaded: state.trackLoaded,
		}))
	);

	const [currentTime, setCurrentTime] = useState(0);
	const [activeLyricId, setActiveLyricId] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const activeLineRef = useRef<HTMLDivElement>(null);

	// Update current time when audio plays
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		audio.addEventListener('timeupdate', updateTime);

		return () => {
			audio.removeEventListener('timeupdate', updateTime);
		};
	}, [trackLoaded, audioRef]);

	// Find the active lyric based on current time
	useEffect(() => {
		if (!lyricLines.length) return;

		// Sort lyrics by timestamp
		const sortedLyrics = [...lyricLines].sort(
			(a, b) => (a.timestamp || 0) - (b.timestamp || 0)
		);

		// Find the last lyric whose timestamp is less than or equal to current time
		let activeIndex = -1;
		for (let i = 0; i < sortedLyrics.length; i++) {
			if ((sortedLyrics[i].timestamp || 0) <= currentTime) {
				activeIndex = i;
			} else {
				break;
			}
		}

		setActiveLyricId(
			activeIndex >= 0 ? sortedLyrics[activeIndex].id : null
		);
	}, [lyricLines, currentTime]);

	// Scroll to active lyric
	useEffect(() => {
		if (activeLyricId && activeLineRef.current && containerRef.current) {
			activeLineRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	}, [activeLyricId]);

	// Sort lyrics by timestamp for display
	const sortedLyrics = [
		...lyricLines.filter((line) => line.timestamp !== undefined),
	].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

	const handleLyricClick = (lineId: number) => {
		jumpToLyricLine({
			id: lineId,
			audioRef,
			videoRef,
		});
	};

	return {
		activeLyricId,
		sortedLyrics,
		containerRef,
		activeLineRef,
		handleLyricClick,
		hasLyrics: sortedLyrics.length > 0,
	};
}
