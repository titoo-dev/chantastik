import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';
import { Controls } from './controls';
import { Waveform } from './wave-form';

export function PlayerControls() {
	const { isMobile, isSmallMobile } = useResponsiveMobile();

	return (
		<div className="flex-1">
			{!isMobile && !isSmallMobile && (
				<div className="mb-3">
					<Waveform />
				</div>
			)}

			<Controls />
		</div>
	);
}
