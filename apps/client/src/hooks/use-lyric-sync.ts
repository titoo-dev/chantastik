import type { LyricLine, ServerLyrics } from "@/data/types";
import { useAppStore } from "@/stores/app/store";
import { useEffect } from "react";

export const useLyricSync = (
	serverLyrics: ServerLyrics | undefined,
	lyricLines: LyricLine[]
) => {
	useEffect(() => {
		if (serverLyrics?.lines && serverLyrics.lines.length > 0) {
			const hasLocalLyrics = lyricLines.length > 0;
			const isDifferent =
				!hasLocalLyrics ||
				serverLyrics.lines.length !== lyricLines.length ||
				serverLyrics.lines.some(
					(line: LyricLine, index: number) =>
						line.text !== lyricLines[index]?.text ||
						line.timestamp !== lyricLines[index]?.timestamp
				);

			if (isDifferent) {
				useAppStore.setState({ lyricLines: serverLyrics.lines });
			}
		}
	}, [serverLyrics?.id, lyricLines.length]);
};
