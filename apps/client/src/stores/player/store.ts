import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PlayerStateProperties {
	volume: number;
	position: number;
	isPlaying: boolean;
	duration: number;
	muted: boolean;
	currentTrackId?: string;
}

export interface PlayerStateActions {
	setPosition: (position: number) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	setDuration: (duration: number) => void;
	play: () => void;
	pause: () => void;
	toggle: () => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setCurrentTrackId?: (id: string) => void;
}

export type PlayerState = PlayerStateProperties & PlayerStateActions;

export const usePlayerStore = create<PlayerState>()(
	devtools(
		(set) => ({
			duration: 1,
			position: 0,
			volume: 1,
			muted: false,
			isPlaying: false,
			currentTrackId: undefined,

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
		}),
		{
			name: 'player-state',
		}
	)
);
