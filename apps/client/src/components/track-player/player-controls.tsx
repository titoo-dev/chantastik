import { Controls } from './controls';
import { Waveform } from './wave-form';

export function PlayerControls() {
	return (
		<div className="flex-1">
			<div className="mb-3">
				<Waveform />
			</div>

			<Controls />
		</div>
	);
}
