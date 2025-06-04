import { useQueryClient } from '@tanstack/react-query';
import {
	createContext,
	useEffect,
	useRef,
	useState,
	type ComponentRef,
	type ReactNode,
	type RefObject,
} from 'react';

export const AudioContext = createContext<{
	audioRef: RefObject<ComponentRef<'audio'> | null>;
	audioState: {
		isPlaying: boolean;
		duration: number;
		currentTime: number;
		volume: number;
		isMuted: boolean;
	};
} | null>(null);

// TODO: implement this to entire app
export function AudioProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const audioRef = useRef<ComponentRef<'audio'> | null>(null);
	const [audioState, setAudioState] = useState<{
		isPlaying: boolean;
		duration: number;
		currentTime: number;
		volume: number;
		isMuted: boolean;
	}>({
		isPlaying: false,
		duration: 0,
		currentTime: 0,
		volume: 1,
		isMuted: false,
	});

	// Audio event handlers
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlers = {
			loadedmetadata: () => {
				setAudioState((oldState) => ({
					...oldState,
					duration: audio.duration,
					volume: audio.volume,
					isMuted: audio.muted,
				}));
				queryClient.invalidateQueries({ queryKey: ['projects'] });
			},
			timeupdate: () => {
				setAudioState((oldState) => ({
					...oldState,
					currentTime: audio.currentTime,
				}));
			},
			ended: () => {
				setAudioState((s) => ({
					...s,
					isPlaying: false,
					currentTime: 0,
				}));
			},
			play: () => {
				setAudioState((s) => ({ ...s, isPlaying: true }));
			},
			pause: () => {
				setAudioState((s) => ({ ...s, isPlaying: false }));
			},
		};

		Object.entries(handlers).forEach(([event, handler]) => {
			audio.addEventListener(event, handler);
		});

		return () => {
			Object.entries(handlers).forEach(([event, handler]) => {
				audio?.removeEventListener(event, handler);
			});
		};
	}, []);

	return (
		<AudioContext.Provider value={{ audioRef, audioState }}>
			{children}
			<audio ref={audioRef} className="hidden" />
		</AudioContext.Provider>
	);
}
