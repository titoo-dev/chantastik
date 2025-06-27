import { usePlayerStore } from "@/stores/player/store";
import { useAudioRefContext } from "./use-audio-ref-context";
import { useEffect } from "react";

export const useVolumeControl = () => {
    const { setVolume, setMuted } = usePlayerStore.getState();
    const { audioRef } = useAudioRefContext();

    useEffect(() => {
        const typedRef = audioRef;

        if (!typedRef.current) return;

        const handleVolumeChange = (e: Event) => {
            const audioEl = e.target as HTMLAudioElement;
            setVolume(audioEl.volume);
            setMuted(audioEl.muted);
        };

        typedRef.current.addEventListener('volumechange', handleVolumeChange);

        return () => {
            if (typedRef.current) {
                typedRef.current.removeEventListener(
                    'volumechange',
                    handleVolumeChange
                );
            }
        };
    }, [audioRef, setMuted, setVolume]);
};