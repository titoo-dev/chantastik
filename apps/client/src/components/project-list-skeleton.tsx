import { Skeleton } from './ui/skeleton';
import { Card, CardHeader } from './ui/card';

export const ProjectListSkeleton = () => {
	return (
		<div className="container mx-auto max-w-8xl grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
			{Array.from({ length: 6 }).map((_, index) => (
				<Card
					key={index}
					className="hover:shadow-none shadow-none h-full flex flex-col"
				>
					<CardHeader className="flex-shrink-0">
						<div className="flex items-center gap-6">
							<Skeleton className="w-20 h-20 rounded-lg" />
							<div className="flex-1 min-w-0 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-16" />
							</div>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
};
