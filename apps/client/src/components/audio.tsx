import { getAudioUrl } from '@/data/api';
import { useAudioEventHandlers } from '@/hooks/use-audio-event-handlers';
import { useAudioHotkeys } from '@/hooks/use-audio-hotkeys';
import { useAudioRefContext } from '@/hooks/use-audio-ref-context';
import { useVolumeControl } from '@/hooks/use-volume-control';
import { useAppStore } from '@/stores/app/store';
import { memo } from 'react';

export const Audio = memo(() => {
	const audio = useAppStore((state) => state.audio);
	const { audioRef } = useAudioRefContext();

	const eventHandlers = useAudioEventHandlers();
	useVolumeControl();
	useAudioHotkeys();

	if (!audio) {
		return null;
	}

	return (
		<audio
			src={getAudioUrl(audio?.id ?? '')}
			ref={audioRef}
			title={audio?.metadata?.title}
			preload="auto"
			className="hidden"
			{...eventHandlers}
		/>
	);
});
