import { ArrowRightCircle, FileText, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useExternalLyricsSection } from '@/hooks/use-external-lyrics-section';
import type { AudioMeta } from '@/data/types';

export function ExternalLyricsSection() {
	const {
		externalLyrics,
		handleConvertToLines,
		handleTextareaChange,
		handleTextareaFocus,
		isConvertDisabled,
		shouldRender,
	} = useExternalLyricsSection();

	const handleGoogleSearch = () => {
		const storedAudioMetadata =
			localStorage.getItem(`currentAudioMetadata`);
		if (!storedAudioMetadata) return null;

		const audioMetadata: AudioMeta = JSON.parse(storedAudioMetadata);

		const url = new URL('https://www.google.com/search');
		url.searchParams.append(
			'q',
			`${audioMetadata?.metadata?.artist} ${audioMetadata?.metadata?.title} lyrics`
		);
		window.open(url.toString(), '_blank');
	};

	if (!shouldRender) {
		return null;
	}

	return (
		<Card className="pt-0 shadow-none overflow-hidden">
			<CardHeader className="flex flex-row items-center justify-between border-b pt-6">
				<CardTitle className="flex items-center gap-2 py-3">
					<FileText className="h-5 w-5 text-primary" />
					External Lyrics
				</CardTitle>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="p-2"
						title="Search for lyrics online"
						onClick={handleGoogleSearch}
					>
						<Globe className="h-4 w-4" />
					</Button>
					<Button
						onClick={handleConvertToLines}
						variant="outline"
						size="sm"
						className="gap-2"
						disabled={isConvertDisabled}
						title="Override lyric lines from this text"
					>
						<ArrowRightCircle className="h-4 w-4" />
						Apply new Lines
					</Button>
				</div>
			</CardHeader>
			<CardContent className="px-4">
				<Textarea
					placeholder="Paste lyrics here, one line per lyric..."
					className="min-h-[200px] w-full resize-none border-muted text-foreground/90 focus:border-primary transition-colors scrollbar-hide overflow-hidden"
					value={externalLyrics}
					onChange={handleTextareaChange}
					onFocus={handleTextareaFocus}
					spellCheck={false}
				/>
				<div className="mt-2 text-sm text-muted-foreground">
					Paste or type song lyrics. Each line will be converted to a
					separate lyric line.
				</div>
			</CardContent>
		</Card>
	);
}
