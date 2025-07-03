import { createFileRoute } from '@tanstack/react-router';

import { LyricEditor } from '@/components/lyric-studio/lyric-editor';
import { LyricsPlayer } from '@/components/lyric-studio/lyrics-player';
import { ExternalLyricsSection } from '@/components/lyric-studio/external-lyrics-section';
import { TrackUploadWrapper } from '@/components/track-upload-wrapper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsiveMobile } from '@/hooks/use-responsive-mobile';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import RenderWhen from '@/components/render-when';
import { useAppStore } from '@/stores/app/store';

export const Route = createFileRoute('/')({
	component: App,
});

function App() {
	const { isMobile, isSmallMobile, isTablet } = useResponsiveMobile();
	const trackLoaded = useAppStore((state) => state.trackLoaded);

	return (
		<ScrollArea className="h-[calc(100vh-65px)]">
			<main className="container mx-auto relative py-6 px-4 md:px-0">
				<RenderWhen
					condition={isMobile || isSmallMobile || isTablet}
					fallback={
						<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
							<LyricEditor />
							<RenderWhen condition={trackLoaded}>
								<Tabs defaultValue="video" className="w-full">
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger
											value="video"
											className="gap-2"
										>
											<FileText className="h-4 w-4" />
											Video Preview
										</TabsTrigger>
										<TabsTrigger
											value="notes"
											className="gap-2"
										>
											<FileText className="h-4 w-4" />
											Notes
										</TabsTrigger>
									</TabsList>
									<TabsContent value="video" className="mt-4">
										<LyricsPlayer />
									</TabsContent>
									<TabsContent value="notes" className="mt-4">
										<ExternalLyricsSection />
									</TabsContent>
								</Tabs>
							</RenderWhen>
						</div>
					}
				>
					<Carousel
						className="w-full max-w-[363px] sm:max-w-2xl md:max-w-4xl mx-auto"
						opts={{
							align: 'start',
							loop: false,
						}}
					>
						<CarouselContent>
							<CarouselItem className="basis-[100%]">
								<LyricEditor />
							</CarouselItem>
							<RenderWhen condition={trackLoaded}>
								<CarouselItem className="basis-[100%]">
									<Tabs
										defaultValue="video"
										className="w-full"
									>
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger
												value="video"
												className="gap-2"
											>
												<FileText className="h-4 w-4" />
												Video Preview
											</TabsTrigger>
											<TabsTrigger
												value="notes"
												className="gap-2"
											>
												<FileText className="h-4 w-4" />
												Notes
											</TabsTrigger>
										</TabsList>
										<TabsContent
											value="video"
											className="mt-4"
										>
											<LyricsPlayer />
										</TabsContent>
										<TabsContent
											value="notes"
											className="mt-4"
										>
											<ExternalLyricsSection />
										</TabsContent>
									</Tabs>
								</CarouselItem>
							</RenderWhen>
						</CarouselContent>
					</Carousel>
				</RenderWhen>

				{/* Spacer for fixed player */}
				<div className="h-58"></div>

				{/* Floating track player with integrated timestamp */}
				<div className="fixed bottom-6 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 transform">
					<TrackUploadWrapper showDownload={false} />
				</div>
			</main>
		</ScrollArea>
	);
}
