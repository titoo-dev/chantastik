import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useLyricsPreviewCard } from '@/hooks/use-lyrics-preview-card';

export function LyricsPreviewCard() {
	const {
		activeLyricId,
		sortedLyrics,
		containerRef,
		activeLineRef,
		handleLyricClick,
		hasLyrics,
	} = useLyricsPreviewCard();

	// If no lyrics, show a placeholder
	if (!hasLyrics) {
		return (
			<div className="flex items-center justify-center h-60 text-muted-foreground">
				No lyrics to preview
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="lyrics-preview-container bg-background/50 backdrop-blur-sm p-6 overflow-hidden relative"
		>
			<div className="lyrics-preview-gradient" />

			<div className="flex flex-col items-center justify-center h-full relative">
				<AnimatePresence>
					{sortedLyrics.map((line) => {
						const isActive = line.id === activeLyricId;

						return (
							<motion.div
								key={line.id}
								ref={isActive ? activeLineRef : undefined}
								className={cn(
									'cursor-pointer text-center py-2 px-4 my-1 transition-all duration-300 rounded-lg',
									isActive
										? 'text-primary font-semibold origin-center'
										: 'opacity-60 hover:opacity-90'
								)}
								initial={{ opacity: 0, y: 20 }}
								animate={{
									opacity: isActive ? 1 : 0.6,
									y: 0,
									scale: isActive ? 1.4 : 1,
									transition: { duration: 0.1 },
								}}
								exit={{ opacity: 0, y: -20 }}
								onClick={() => handleLyricClick(line.id)}
								style={{
									position: 'relative',
									zIndex: isActive ? 2 : 1,
								}}
							>
								<span
									className={cn(
										isActive ? 'text-lg' : 'text-base'
									)}
								>
									{line.text || '(Empty lyric)'}
								</span>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
