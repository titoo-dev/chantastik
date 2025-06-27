import { cn } from '@/lib/utils';
import { CoverArt } from './cover-art';
import { PlayerControls } from './player-controls';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';

export function TrackPlayerMain({
	coverArt,
	title,
}: {
	coverArt: string;
	title: string;
}) {
	const { isMobile } = useResponsiveMobile();
	
	return (
		<div className={cn("flex items-center", !isMobile && "gap-5")}>
			<CoverArt coverArt={coverArt} title={title} />
			<PlayerControls />
		</div>
	);
}
