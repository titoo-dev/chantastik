interface LoadingProgressProps {
	audioFileName?: string;
}

export function LoadingProgress({ audioFileName }: LoadingProgressProps) {
	return (
		<div className="container mx-auto px-4">
			<div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-6 rounded-xl border-2 border-dashed border-primary/30 bg-background/95 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
				<div className="w-full max-w-md mx-auto mt-2 mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-muted-foreground">
							Processing
						</span>
						<span className="text-xs font-medium text-primary">
							{audioFileName}
						</span>
					</div>
					<div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30">
						<div
							className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full w-full"
							style={{
								backgroundSize: '200% 100%',
								animation: 'shimmer 2s infinite linear',
							}}
						/>
						<div
							className="absolute inset-0 w-full rounded-full bg-primary/20 blur-[3px]"
							style={{
								animation: 'pulse 1.5s infinite ease-in-out',
							}}
						/>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-1 text-center">
					This may take a moment depending on file size
				</p>
			</div>
		</div>
	);
}
