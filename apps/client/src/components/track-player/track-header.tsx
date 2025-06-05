import { downloadAudioFile } from '@/data/api';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

export function TrackHeader({
	title,
	icon: Icon,
	iconColor,
	src,
	showDownload,
}: {
	title: string;
	icon: React.ComponentType<any>;
	iconColor: string;
	src: string;
	showDownload: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<h3 className="flex items-center gap-2 font-medium">
				<Icon className={`h-4 w-4 ${iconColor}`} />
				<span className="text-sm max-w-96 truncate">{title}</span>
			</h3>
			<div className="flex items-center gap-1">
				{showDownload && (
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 rounded-full hover:bg-accent hover:text-accent-foreground"
						onClick={() => downloadAudioFile(src)}
						title="Download track"
					>
						<Download className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
}
