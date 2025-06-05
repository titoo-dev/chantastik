import { useContext } from 'react';
import { AudioRefContext } from '@/context/audio-ref-context';

export function useAudioRefContext() {
	const context = useContext(AudioRefContext);
	if (!context)
		throw new Error('useAudioRef must be used within an AudioProvider');
	return context;
}
