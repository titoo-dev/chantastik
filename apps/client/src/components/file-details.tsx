export function FileDetails({ file }: { file: File }) {
	return (
		<div className="rounded-lg bg-card p-4 shadow-sm">
			<h3 className="mb-2 font-semibold">File Details</h3>
			<div className="grid gap-1 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Name:</span>
					<span className="font-medium">{file.name}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Size:</span>
					<span className="font-medium">
						{(file.size / (1024 * 1024)).toFixed(2)} MB
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Type:</span>
					<span className="font-medium">{file.type}</span>
				</div>
			</div>
		</div>
	);
}
