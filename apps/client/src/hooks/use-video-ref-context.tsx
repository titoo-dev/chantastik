import { VideoRefContext } from '@/context/video-ref-context';
import { useContext } from 'react';

export function useVideoRefContext() {
	const context = useContext(VideoRefContext);
	if (!context)
		throw new Error('useVideoRef must be used within a VideoProvider');
	return context;
}
