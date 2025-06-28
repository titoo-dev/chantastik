import { useAppStore } from "@/stores/app/store";
import { useAudioRefContext } from "./use-audio-ref-context";
import { useShallow } from "zustand/react/shallow";
import { useGetLyrics } from "./use-get-lyrics";

export const useLyricEditor = () => {
    const { audioRef } = useAudioRefContext();

    const { updateLyricLine, deleteLyricLine, addLyricLine, projectId, undo } =
        useAppStore.getState();

    const { lyricLines, trackLoaded, commandHistory } =
        useAppStore(
            useShallow((state) => ({
                lyricLines: state.lyricLines,
                trackLoaded: state.trackLoaded,
                projectId: state.projectId,
                commandHistory: state.commandHistory,
            }))
        );

    const {
        data: serverLyrics,
        isLoading: isLoadingLyrics,
        error: lyricsError,
    } = useGetLyrics({
        projectId: projectId || '',
        enabled: !!projectId && trackLoaded,
    });

    return {
		audioRef,
		lyricLines,
		trackLoaded,
		serverLyrics,
		isLoadingLyrics,
		lyricsError,
		updateLyricLine,
		deleteLyricLine,
		addLyricLine,
		undo,
		commandHistory,
	};
};