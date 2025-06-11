import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LyricsPreviewCard } from '../lyrics-preview-card';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/app/store';

export function LyricPreviewSection() {
	const { showExternalLyrics, showVideoPreview } = useAppStore(
		useShallow((state) => ({
			showExternalLyrics: state.showExternalLyrics,
			showVideoPreview: state.showVideoPreview,
		}))
	);

	if (showExternalLyrics || showVideoPreview) {
		return null; // Don't render if external lyrics or video preview are visible
	}

	return (
		<Card className="pt-0 shadow-none overflow-hidden">
			<CardHeader className="flex flex-row items-center border-b pt-6">
				<CardTitle className="flex items-center gap-2 py-3">
					<Eye className="h-5 w-5 text-primary" />
					Lyrics Preview
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<LyricsPreviewCard />
			</CardContent>
		</Card>
	);
}
