import { memo } from 'react';
import { PlayPauseButton } from './play-pause-button';
import { VolumeControls } from './volume-controls';
import { TimeSlider } from './time-slider';
import { CurrentTime } from './current-time';
import { Duration } from './duration';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';
import { cn } from '@/lib/utils';

export const Controls = memo(() => {
	const { isMobile, isSmallMobile } = useResponsiveMobile();

	return (
		<div className={cn("flex items-center gap-2", {
			"mb-3": !isMobile && !isSmallMobile
		})}>
			{!isMobile && !isSmallMobile && <PlayPauseButton />}
			<CurrentTime />
			<TimeSlider />
			<Duration />
			{!isMobile && !isSmallMobile && <VolumeControls />}
		</div>
	);
});
