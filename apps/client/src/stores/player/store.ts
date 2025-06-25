import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
export type PlayerStateProperties = {
	volume: number;
	position: number;
	isPlaying: boolean;
	duration: number;
	muted: boolean;
	currentTrackId?: string;
	waveBars: number[];
};

export type PlayerStateActions = {
	setPosition: (position: number) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	setDuration: (duration: number) => void;
	play: () => void;
	pause: () => void;
	toggle: () => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setCurrentTrackId?: (id: string) => void;
	reset: () => void;
};

export type PlayerState = PlayerStateProperties & PlayerStateActions;

const initialState: PlayerStateProperties = {
	duration: 1,
	position: 0,
	volume: 1,
	muted: false,
	isPlaying: false,
	currentTrackId: undefined,
	waveBars: Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2),
};

export const usePlayerStore = create<PlayerState>()(
	devtools(
		(set) => ({
			...initialState,

			setMuted(muted) {
				set({ muted });
			},

			setVolume(volume) {
				set({ volume });
			},

			setPosition: (position) => set({ position }),
			setDuration: (duration) => set({ duration }),
			setIsPlaying: (isPlaying) => set({ isPlaying }),
			setCurrentTrackId: (id) => set({ currentTrackId: id }),

			play: () => set({ isPlaying: true }),
			pause: () => set({ isPlaying: false }),
			toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
			reset: () => set(initialState),
		}),
		{
			name: 'player-state',
		}
	)
);
