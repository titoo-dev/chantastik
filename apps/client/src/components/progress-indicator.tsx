import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BASE_URL } from '@/data/api';

interface ProcessingStatus {
	status: 'started' | 'processing' | 'completed' | 'failed' | 'error';
	message: string;
	progress: number;
	files?: {
		vocals: string;
		instrumental: string;
	};
}

export function ProcessingIndicator() {
	const [status, setStatus] = useState<ProcessingStatus>({
		status: 'started',
		message: 'Starting audio separation',
		progress: 0,
	});

	const [downloadProgress, setDownloadProgress] = useState<{
		progress: number;
		message: string;
	}>({
		progress: 0,
		message: 'Preparing to download',
	});

	useEffect(() => {
		const eventSource = new EventSource(`${BASE_URL}/audio/stream`);

		eventSource.addEventListener('separation-progress', (event) => {
			const data = JSON.parse(event.data);
			setStatus(data);
		});

		eventSource.addEventListener('download-progress', (event) => {
			const data = JSON.parse(event.data);
			setDownloadProgress(data);
		});

		return () => {
			eventSource.close();
		};
	}, []);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center">
					{status.status !== 'completed' && (
						<Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
					)}
					Audio Separation
					{status.status !== 'completed' && (
						<Badge
							variant={
								status.status === 'error' ||
								status.status === 'failed'
									? 'destructive'
									: 'secondary'
							}
							className="ml-2"
						>
							{status.status}
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{downloadProgress.progress > 0 &&
					downloadProgress.progress < 100 && (
						<div className="mb-4">
							<div className="flex justify-between text-sm mb-1">
								<span>Downloading YouTube video</span>
								<span>
									{Math.round(downloadProgress.progress)}%
								</span>
							</div>
							<Progress
								value={downloadProgress.progress}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								{downloadProgress.message}
							</p>
						</div>
					)}

				{status.status !== 'completed' && (
					<Progress value={status.progress} className="h-2 mb-4" />
				)}

				<div className="text-sm text-muted-foreground">
					{status.status === 'processing' && <p>{status.message}</p>}
					{status.status === 'started' && (
						<p>Preparing audio files for separation...</p>
					)}
					{(status.status === 'error' ||
						status.status === 'failed') && (
						<p className="text-destructive">
							An error occurred during processing.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
