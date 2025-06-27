import { useAppStore } from "@/stores/app/store";
import { useSaveLyrics } from "./use-save-lyrics";
import { toast } from "sonner";

export const useSaveLyricsHandler = () => {
    const currentProjectId = useAppStore((state) => state.projectId);
    const lyricLines = useAppStore((state) => state.lyricLines);
    const saveLyricsMutation = useSaveLyrics();

    const handleSaveLyrics = async () => {
        if (!currentProjectId) {
            toast.error('No Project Selected', {
                description: 'Please select a project before saving lyrics.',
            });
            return;
        }

        if (!lyricLines || lyricLines.length === 0) {
            toast.error('No Lyrics to Save', {
                description: 'Please add some lyrics before saving.',
            });
            return;
        }

        try {
            // Convert lyric lines to text format
            const text = lyricLines.map((line) => line.text).join('\n');

            await saveLyricsMutation.mutateAsync({
                projectId: currentProjectId,
                text,
                lines: lyricLines,
            });
        } catch (error) {
            // Error handling is done in the mutation hook
            console.error('Failed to save lyrics:', error);
        }
    };

    return {
        handleSaveLyrics,
        saveLyricsMutation,
    };
}