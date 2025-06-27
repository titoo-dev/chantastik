import { useAppStore } from "@/stores/app/store";
import { useAudioRefContext } from "./use-audio-ref-context";
import { useShallow } from "zustand/react/shallow";
import { useGetLyrics } from "./use-get-lyrics";

export const useLyricEditor = () => {
    const { audioRef } = useAudioRefContext();

    const { updateLyricLine, deleteLyricLine, addLyricLine, projectId } =
        useAppStore.getState();

    const { lyricLines, showExternalLyrics, showVideoPreview, trackLoaded } =
        useAppStore(
            useShallow((state) => ({
                lyricLines: state.lyricLines,
                showExternalLyrics: state.showExternalLyrics,
                showVideoPreview: state.showVideoPreview,
                trackLoaded: state.trackLoaded,
                projectId: state.projectId,
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
        showExternalLyrics,
        showVideoPreview,
        trackLoaded,
        serverLyrics,
        isLoadingLyrics,
        lyricsError,
        updateLyricLine,
        deleteLyricLine,
        addLyricLine,
    };
};