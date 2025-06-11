import { ArrowRightCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useExternalLyricsSection } from '@/hooks/use-external-lyrics-section';

export function ExternalLyricsSection() {
	const {
		externalLyrics,
		handleConvertToLines,
		handleTextareaChange,
		handleTextareaFocus,
		isConvertDisabled,
		shouldRender,
	} = useExternalLyricsSection();

	if (!shouldRender) {
		return null;
	}
	return (
		<Card
			data-onboarding="external-lyrics"
			className="pt-0 shadow-none overflow-hidden"
		>
			<CardHeader className="flex flex-row items-center justify-between border-b pt-6">
				<CardTitle className="flex items-center gap-2 py-3">
					<FileText className="h-5 w-5 text-primary" />
					External Lyrics
				</CardTitle>
				<Button
					onClick={handleConvertToLines}
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={isConvertDisabled}
					title="Create lyric lines from this text"
				>
					<ArrowRightCircle className="h-4 w-4" />
					Convert to Lines
				</Button>
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
