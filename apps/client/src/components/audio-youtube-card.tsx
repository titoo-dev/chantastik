import { ChevronDown, Loader2, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import type { SeparationResponse } from '@/data/api';
import { useState } from 'react';

import type { VideoMetadata } from '@/types/video';

interface AudioYoutubeCardProps {
	separateYoutubeMutation: any;
	handleSeparateYoutube: (url: string, videoTitle?: string | null) => void;
	separationResponse: SeparationResponse | null;
	youtubeUrl: string;
	isUrlValid: boolean;
	isValidating: boolean;
	validationMessage: string;
	videoMetadata: VideoMetadata | null;
	handleUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AudioYoutubeCard({
	separateYoutubeMutation,
	handleSeparateYoutube,
	separationResponse,
	youtubeUrl,
	isUrlValid,
	isValidating,
	validationMessage,
	videoMetadata,
	handleUrlChange,
}: AudioYoutubeCardProps) {
	const [isMetadataOpen, setIsMetadataOpen] = useState(false);

	// Extract video ID from YouTube URL - needed for fallback thumbnail
	const extractVideoId = (url: string): string | null => {
		const regExp =
			/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
		const match = url.match(regExp);
		return match ? match[1] : null;
	};

	const handleSeparate = () => {
		if (isUrlValid && youtubeUrl) {
			// Pass video title if available for better notification
			const videoTitle = videoMetadata?.title || null;
			handleSeparateYoutube(youtubeUrl, videoTitle);
		}
	};

	// Format duration in MM:SS
	const formatDuration = (seconds?: number) => {
		if (!seconds) return 'Unknown';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Youtube className="h-5 w-5 text-primary" />
					YouTube Audio
				</CardTitle>
				<CardDescription>
					Paste a YouTube URL to separate vocals from instruments
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className="relative">
						<Input
							type="url"
							placeholder="https://www.youtube.com/watch?v=..."
							value={youtubeUrl}
							onChange={handleUrlChange}
							disabled={
								separateYoutubeMutation.isPending ||
								separationResponse
							}
							className={cn(
								isValidating &&
									'border-amber-500 ring-amber-500/20',
								!isValidating &&
									isUrlValid &&
									'border-green-500 ring-green-500/20',
								!isValidating &&
									youtubeUrl &&
									!isUrlValid &&
									'border-red-500 ring-red-500/20'
							)}
						/>
						{isValidating && (
							<div className="absolute right-3 top-0 h-full flex items-center">
								<span className="flex items-center text-xs text-amber-500">
									<Loader2 className="mr-1 h-3 w-3 animate-spin" />
									Validating...
								</span>
							</div>
						)}
					</div>

					{youtubeUrl &&
						!isUrlValid &&
						!isValidating &&
						validationMessage && (
							<p className="text-sm text-red-500">
								{validationMessage}
							</p>
						)}

					{isUrlValid && !isValidating && (
						<p className="text-sm text-green-500">
							{validationMessage}
						</p>
					)}
				</div>

				{isUrlValid && !isValidating && videoMetadata && (
					<div className="rounded-lg border border-border bg-card/50">
						<div
							className="flex items-center gap-3 p-4 cursor-pointer"
							onClick={() => setIsMetadataOpen(!isMetadataOpen)}
						>
							<div className="h-16 w-20 flex-shrink-0 rounded bg-muted overflow-hidden">
								<img
									src={
										videoMetadata.thumbnail_url ||
										`https://img.youtube.com/vi/${extractVideoId(
											youtubeUrl
										)}/default.jpg`
									}
									alt="Video thumbnail"
									className="h-full w-full object-cover"
									onError={(e) => {
										// Fallback if thumbnail can't be loaded
										e.currentTarget.style.display = 'none';
										const parent =
											e.currentTarget.parentElement;
										if (parent) {
											parent.innerHTML =
												'<div class="flex h-full w-full items-center justify-center text-muted-foreground"><svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg></div>';
										}
									}}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<p className="truncate font-medium">
									{videoMetadata.title || 'Unknown title'}
								</p>
								<p className="text-sm text-muted-foreground">
									{videoMetadata.author_name ||
										'Unknown channel'}
								</p>
							</div>
							<div className="text-muted-foreground">
								<ChevronDown
									className={cn(
										'h-5 w-5 transition-transform',
										isMetadataOpen && 'rotate-180'
									)}
								/>
							</div>
						</div>

						{isMetadataOpen && (
							<div className="border-t border-border p-4 space-y-3 bg-muted/30">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="space-y-1">
										<p className="font-medium text-muted-foreground">
											Video dimensions
										</p>
										<p>
											{videoMetadata.width} ×{' '}
											{videoMetadata.height}
										</p>
									</div>
									<div className="space-y-1">
										<p className="font-medium text-muted-foreground">
											Duration
										</p>
										<p>
											{formatDuration(
												videoMetadata.duration
											)}
										</p>
									</div>
									<div className="space-y-1 col-span-2">
										<p className="font-medium text-muted-foreground">
											Full title
										</p>
										<p className="break-words">
											{videoMetadata.title}
										</p>
									</div>
									<div className="space-y-1 col-span-2">
										<p className="font-medium text-muted-foreground">
											Channel
										</p>
										<p>{videoMetadata.author_name}</p>
									</div>
									<div className="space-y-1 col-span-2">
										<p className="font-medium text-muted-foreground">
											URL
										</p>
										<p className="break-all text-xs">
											{youtubeUrl}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				<div className="flex justify-end">
					<Button
						variant="default"
						disabled={
							!isUrlValid ||
							isValidating ||
							separateYoutubeMutation.isPending ||
							separationResponse
						}
						onClick={handleSeparate}
					>
						{separateYoutubeMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing YouTube Audio...
							</>
						) : (
							<>Separate Audio</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
