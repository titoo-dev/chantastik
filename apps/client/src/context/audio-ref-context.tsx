import {
	createContext,
	useRef,
	type ComponentRef,
	type ReactNode,
	type RefObject,
} from 'react';

export const AudioRefContext = createContext<{
	audioRef: RefObject<ComponentRef<'audio'> | null>;
} | null>(null);

export function AudioRefProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<ComponentRef<'audio'> | null>(null);

	return (
		<AudioRefContext.Provider value={{ audioRef }}>
			{children}
		</AudioRefContext.Provider>
	);
}
