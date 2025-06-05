import type { PlayerRef } from '@remotion/player';
import { createContext, useRef, type ReactNode, type RefObject } from 'react';

export const VideoRefContext = createContext<{
	videoRef: RefObject<PlayerRef | null>;
} | null>(null);

export function VideoRefProvider({ children }: { children: ReactNode }) {
	const videoRef = useRef<PlayerRef | null>(null);

	return (
		<VideoRefContext.Provider value={{ videoRef }}>
			{children}
		</VideoRefContext.Provider>
	);
}
