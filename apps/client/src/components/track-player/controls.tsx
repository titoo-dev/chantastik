import { memo } from 'react';
import { PlayPauseButton } from './play-pause-button';
import { VolumeControls } from './volume-controls';
import { TimeSlider } from './time-slider';
import { CurrentTime } from './current-time';
import { Duration } from './duration';

export const Controls = memo(() => {
	return (
		<div className="mb-3 flex items-center gap-2">
			<PlayPauseButton />
			<CurrentTime />
			<TimeSlider />
			<Duration />
			<VolumeControls />
		</div>
	);
});
