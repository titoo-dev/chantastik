import { Info, Monitor, Smartphone } from 'lucide-react';
import RenderWhen from '../render-when';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import type { AspectRatioType } from '@/data/types';

type Props = {
	aspectRatio: AspectRatioType;
	onAspectRatioChange: (ratio: AspectRatioType) => void;
};

export const PlayerToolbar: React.FC<Props> = ({
	aspectRatio,
	onAspectRatioChange,
}) => {
	return (
		<div className="space-y-3" data-testid="player-toolbar-container">
			<div
				className="flex gap-2 items-center"
				data-testid="toolbar-controls"
			>
				<RenderWhen
					condition={import.meta.env.VITE_NODE_ENV === 'development'}
				>
					<div
						className="flex space-x-2 py-3"
						data-testid="aspect-ratio-controls"
					>
						<Button
							variant={
								aspectRatio === 'horizontal'
									? 'default'
									: 'outline'
							}
							size="sm"
							onClick={() => onAspectRatioChange('horizontal')}
							data-testid="horizontal-aspect-ratio-button"
						>
							<Monitor className="w-4 h-4 mr-2" />
							YouTube
						</Button>
						<Button
							variant={
								aspectRatio === 'vertical'
									? 'default'
									: 'outline'
							}
							size="sm"
							onClick={() => onAspectRatioChange('vertical')}
							data-testid="vertical-aspect-ratio-button"
						>
							<Smartphone className="w-4 h-4 mr-2" />
							TikTok
						</Button>
					</div>
				</RenderWhen>
				<div className="flex-1" />
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							data-testid="info-popover-trigger"
						>
							<Info className="w-4 h-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-80"
						data-testid="info-popover-content"
					>
						<p className="text-sm" data-testid="info-message">
							If you close and reopen the video player, it may
							lose sync with the audio or stop playing. Simply
							restart playbook.
						</p>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};
