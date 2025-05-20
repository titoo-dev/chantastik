import { useContext } from 'react';
import { AppContext } from '@/context/app-context';

export function useAppContext() {
	const context = useContext(AppContext);
	if (!context)
		throw new Error('useAudioRef must be used within an AudioProvider');
	return context;
}
