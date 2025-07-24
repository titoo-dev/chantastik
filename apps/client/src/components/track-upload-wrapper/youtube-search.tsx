import { createProjectFromYouTube, extractLyricsFromVideo, searchYouTube, type YouTubeSearchResult } from '@/data/api';
import { cn, extractVideoId, isValidYoutubeUrl, parseYouTubeDuration } from '@/lib/utils';
import { ExternalLink, Loader2, PlayCircle, Plus, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

type YouTubeSearchProps = {
	onVideoSelect?: (video: YouTubeSearchResult) => void;
	className?: string;
};

export function YouTubeSearch({ onVideoSelect, className }: Readonly<YouTubeSearchProps>) {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasSearched, setHasSearched] = useState(false);

	// Debounced search function
	const performSearch = useCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			setHasSearched(false);
			return;
		}

		setIsSearching(true);
		setError(null);
		setHasSearched(true);

		try {
			// Check if it's a direct YouTube URL
			if (isValidYoutubeUrl(query)) {
				const videoId = extractVideoId(query);
				if (videoId) {
					// For direct URLs, create a single result
					const directVideo: YouTubeSearchResult = {
						id: videoId,
						title: 'Video from URL',
						description: '',
						thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
						channelTitle: 'Unknown Channel',
						publishedAt: new Date().toISOString(),
						duration: 'PT0S',
						url: query,
					};
					setSearchResults([directVideo]);
					setIsSearching(false);
					return;
				}
			}

			// Use the real YouTube search API with search type
			const response = await searchYouTube(query);
			setSearchResults(response.results);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Search failed');
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	}, []);

	// Debounce effect for auto-search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			setHasSearched(false);
			return;
		}

		const debounceTimer = setTimeout(() => {
			performSearch(searchQuery);
		}, 500); // 500ms delay

		return () => clearTimeout(debounceTimer);
	}, [searchQuery, performSearch]);



	const handleVideoSelect = (video: YouTubeSearchResult) => {
		onVideoSelect?.(video);
	};

	const handleAddToPlaylist = async (video: YouTubeSearchResult, event: React.MouseEvent) => {
		event.stopPropagation();
		setAddingToPlaylist(video.id);
		
		try {
			// Create project from YouTube video
			await createProjectFromYouTube(video);

			// Extract lyrics if available
			try {
				await extractLyricsFromVideo(video.id, video.title, video.channelTitle);
			} catch (lyricsError) {
				console.warn('Could not extract lyrics:', lyricsError);
			}

			// Show success message
			toast.success('Video added to playlist', {
				description: `Added "${video.title}" to your playlist.`,
			});			
		} catch (error) {
			console.error('Failed to add to playlist:', error);
			setError(error instanceof Error ? error.message : 'Failed to add to playlist');
		} finally {
			setAddingToPlaylist(null);
		}
	};

	return (
		<Card className={cn('shadow-none border-muted/40', className)}>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-lg">
					<PlayCircle className="h-5 w-5 text-red-500" />
					Search Youtube Music to listen to
				</CardTitle>
				<CardDescription>
					Search for your favorite songs and add them to your playlist.
					You only can listen to the songs, not download them.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 h-[250px]">
				{/* Search Input */}
				<div className="relative">
					<Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
					<Input
						placeholder={ "Search by song title (e.g., 'Shake It Off', 'Bohemian Rhapsody')..." 
						}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
						disabled={isSearching}
					/>
					{isSearching && (
						<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
					)}
				</div>

				{/* Error Message */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Search Results */}
				<div className="space-y-3">
					<AnimatePresence>
						{searchResults.length > 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-3  h-[200px] overflow-y-auto"
							>
								<h4 className="text-sm font-medium text-muted-foreground">
									Search Results
								</h4>
								{searchResults.map((video, index) => (
									<motion.div
										key={video.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="group cursor-pointer"
										onClick={() => handleVideoSelect(video)}
									>
										<div className="flex gap-3 p-3 rounded-lg border border-muted/40 hover:border-primary/40 hover:bg-muted/20 transition-all duration-200">
											{/* Thumbnail */}
											<div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
												<img
													src={video.thumbnail}
													alt={video.title}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA5NiA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCAzMkwzNiAyNFY0MEw0OCAzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
													}}
												/>
												<div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
												<Badge
													variant="secondary"
													className="absolute bottom-1 right-1 text-xs bg-black/70 text-white"
												>
													{parseYouTubeDuration(video.duration)}
												</Badge>
											</div>

											{/* Video Info */}
											<div className="flex-1 min-w-0">
												<h5 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
													{video.title}
												</h5>
												<p className="text-xs text-muted-foreground mt-1">
													{video.channelTitle}
												</p>
												<div className="flex items-center gap-2 mt-2">
													<Badge variant="outline" className="text-xs">
														<PlayCircle className="h-3 w-3 mr-1" />
														YouTube
													</Badge>
												</div>
											</div>

											{/* Action Buttons */}
											<div className="flex items-center gap-2">
												{/* Add to Playlist Button */}
												<Button
													size="sm"
													variant="ghost"
													className="opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={(e) => handleAddToPlaylist(video, e)}
													disabled={addingToPlaylist === video.id}
													title="Add to playlist without downloading"
												>
													{addingToPlaylist === video.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Plus className="h-4 w-4" />
													)}
												</Button>
												
												{/* External Link Button */}
												<Button
													size="sm"
													variant="ghost"
													className="opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={(e) => {
														e.stopPropagation();
														window.open(video.url, '_blank');
													}}
													title="Open on YouTube"
												>
													<ExternalLink className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</motion.div>
								))}
							</motion.div>
						)}
					</AnimatePresence>

					{/* No Results Message */}
					<AnimatePresence>
						{hasSearched && searchResults.length === 0 && !isSearching && !error && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="text-center py-8"
							>
								<PlayCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
								<p className="text-sm text-muted-foreground mb-2">
									No videos found
								</p>
								<p className="text-xs text-muted-foreground">
									Try searching with different keywords or paste a direct YouTube URL
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Helper Text */}
				{!hasSearched && (
					<div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
						<p className="mb-1">💡 <strong>Tip:</strong> You can:</p>
						<ul className="list-disc list-inside space-y-1 ml-4 h-full py-2">
							<li>Search for song titles, artists, or keywords</li>
							<li>Paste a direct YouTube URL</li>
							<li>Click on any result to select it to add it into your playlist</li>
							<li> ⚠️ Listen to these songs ⚠️ </li>
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
