import { memo } from 'react';
import { useAppStore } from '@/stores/app/store';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';

export const LyricStudioHeader = memo(() => {
	const trackLoaded = useAppStore((state) => state.trackLoaded);

	const { isMobile, isSmallMobile } = useResponsiveMobile();

	if (isMobile || isSmallMobile) {
		return (
			<div className="mb-6 space-y-4">
				<div className="text-center">
					<h1
						data-testid="title"
						className="text-2xl font-bold tracking-tight leading-relaxed"
					>
						Create Amazing Lyrics
					</h1>
					<p className="text-muted-foreground leading-relaxed text-sm">
						{trackLoaded
							? 'Create and edit lyrics for your track'
							: 'Upload an audio track to get started'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mb-6 space-y-4">
			<div className="flex flex-row items-center justify-between">
				<div>
					<h1
						data-testid="title"
						className="text-3xl font-bold tracking-tight leading-relaxed"
					>
						Create Amazing Lyrics
					</h1>
					<p className="text-muted-foreground leading-relaxed">
						{trackLoaded
							? 'Create and edit lyrics for your track'
							: 'Upload an audio track to get started'}
					</p>
				</div>
			</div>
		</div>
	);
});
