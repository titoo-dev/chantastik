import { cn } from '@/lib/utils';
import { UploadIcon, Youtube } from 'lucide-react';

interface TabsProps {
	activeTab: 'upload' | 'youtube';
	onTabChange: (tab: 'upload' | 'youtube') => void;
	isDisabled: boolean;
}

export function Tabs({ activeTab, onTabChange, isDisabled }: TabsProps) {
	return (
		<div className="mb-8">
			<div className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-1.5 shadow-sm">
				<button
					onClick={() => onTabChange('upload')}
					className={cn(
						'inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						activeTab === 'upload'
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-muted',
						isDisabled && 'opacity-50 cursor-not-allowed'
					)}
					disabled={isDisabled}
				>
					<UploadIcon
						className={cn(
							'mr-2.5 h-4 w-4',
							activeTab === 'upload'
								? 'text-primary-foreground'
								: 'text-primary'
						)}
					/>
					File Upload
				</button>
				<button
					onClick={() => onTabChange('youtube')}
					className={cn(
						'inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-2',
						activeTab === 'youtube'
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-muted',
						isDisabled && 'opacity-50 cursor-not-allowed'
					)}
					disabled={isDisabled}
				>
					<Youtube
						className={cn(
							'mr-2.5 h-4 w-4',
							activeTab === 'youtube'
								? 'text-primary-foreground'
								: 'text-primary'
						)}
					/>
					YouTube
				</button>
			</div>
		</div>
	);
}
