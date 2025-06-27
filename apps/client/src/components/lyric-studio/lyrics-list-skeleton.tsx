import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type LyricsListSkeletonProps = {
	className?: string;
};

export function LyricsListSkeleton({ className }: LyricsListSkeletonProps) {
	return (
		<Card className={cn("pt-0 shadow-none", className)}>
			{/* Header Skeleton */}
			<div className="border-b bg-muted/30 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Skeleton className="h-6 w-6 rounded-full" />
						<Skeleton className="h-5 w-24" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-24" />
					</div>
				</div>
			</div>

			<CardContent className="p-6">
				{/* Selection banner skeleton */}
				<div className="mb-4 p-3 bg-muted/20 border border-muted rounded-lg">
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-32" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-8 w-28" />
						</div>
					</div>
				</div>

				{/* Lyric lines skeleton */}
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className="group relative rounded-lg border bg-card/50 overflow-hidden"
						>
							<div className="flex items-center gap-3 p-3">
								{/* Line number badge */}
								<Skeleton className="w-8 h-8 rounded-full shrink-0" />

								{/* Text input area */}
								<div className="flex-1">
									<Skeleton
										className="h-10 w-full"
										style={{
											width: `${Math.random() * 40 + 60}%`,
										}}
									/>
								</div>

								{/* Control buttons */}
								<div className="flex items-center gap-3 shrink-0">
									{/* Timestamp control */}
									<Skeleton className="h-8 w-16" />

									{/* Add line button */}
									<Skeleton className="h-8 w-8 rounded-full" />

									{/* Delete button */}
									<Skeleton className="h-8 w-8 rounded-full" />
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Add line button skeleton */}
				<div className="flex justify-center mt-6">
					<Skeleton className="h-10 w-24" />
				</div>
			</CardContent>
		</Card>
	);
}
