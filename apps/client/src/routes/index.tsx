import { createFileRoute } from '@tanstack/react-router';

import { LyricStudioHeader } from '@/components/lyric-studio/lyrics-studio-header';
import { LyricEditor } from '@/components/lyric-studio/lyric-editor';
import { LyricsPlayer } from '@/components/lyric-studio/lyrics-player';
import { LyricPreviewSection } from '@/components/lyric-studio/lyric-preview-section';
import { ExternalLyricsSection } from '@/components/lyric-studio/external-lyrics-section';
import { TrackUploadWrapper } from '@/components/track-upload-wrapper';

export const Route = createFileRoute('/')({
	component: App,
});

function App() {
	return (
		<main className="container relative min-h-screen py-6">
			<LyricStudioHeader />

			{/* Main content area */}
			<div className="grid gap-6 grid-cols-2">
				<LyricEditor />
				<LyricsPlayer />
				<LyricPreviewSection />
				<ExternalLyricsSection />
			</div>

			{/* Spacer for fixed player */}
			<div className="h-58"></div>

			{/* Floating track player with integrated timestamp */}
			<div className="fixed bottom-6 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 transform">
				<TrackUploadWrapper
					iconColor="text-blue-500"
					showDownload={false}
				/>
			</div>
		</main>
	);
}
