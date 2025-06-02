import { memo } from 'react';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from './ui/drawer';
import { FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';

type Project = {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	lyricsId?: string;
	audioId: string;
	assetIds?: string[];
};

// Mock data for demonstration
const mockProjects: Project[] = [
	{
		id: '1',
		name: 'Summer Vibes',
		description: 'A chill summer anthem with tropical beats',
		createdAt: '2024-01-15T10:30:00Z',
		updatedAt: '2024-01-20T14:22:00Z',
		audioId: 'audio_1',
		assetIds: ['asset_1', 'asset_2'],
	},
	{
		id: '2',
		name: 'Midnight Blues',
		description: 'Soulful blues track for late night sessions',
		createdAt: '2024-01-10T09:15:00Z',
		updatedAt: '2024-01-18T16:45:00Z',
		audioId: 'audio_2',
		lyricsId: 'lyrics_1',
	},
	{
		id: '3',
		name: 'Electric Dreams',
		createdAt: '2024-01-05T11:20:00Z',
		updatedAt: '2024-01-12T13:30:00Z',
		audioId: 'audio_3',
	},
	{
		id: '4',
		name: 'Neon Nights',
		description: 'Synthwave journey through a cyberpunk cityscape',
		createdAt: '2024-01-22T15:45:00Z',
		updatedAt: '2024-01-25T11:30:00Z',
		audioId: 'audio_4',
		lyricsId: 'lyrics_2',
	},
	{
		id: '5',
		name: 'Acoustic Soul',
		description: 'Raw, emotional acoustic performance',
		createdAt: '2024-01-08T08:20:00Z',
		updatedAt: '2024-01-19T09:15:00Z',
		audioId: 'audio_5',
		assetIds: ['asset_3'],
	},
	{
		id: '6',
		name: 'Heavy Metal Thunder',
		description: 'Crushing riffs and thunderous drums',
		createdAt: '2024-01-12T14:30:00Z',
		updatedAt: '2024-01-24T17:20:00Z',
		audioId: 'audio_6',
		lyricsId: 'lyrics_3',
		assetIds: ['asset_4', 'asset_5', 'asset_6'],
	},
	{
		id: '7',
		name: 'Jazz Fusion',
		createdAt: '2024-01-03T12:00:00Z',
		updatedAt: '2024-01-16T10:45:00Z',
		audioId: 'audio_7',
	},
	{
		id: '8',
		name: 'Pop Sensation',
		description: 'Catchy hooks and infectious energy',
		createdAt: '2024-01-18T16:15:00Z',
		updatedAt: '2024-01-26T13:40:00Z',
		audioId: 'audio_8',
		lyricsId: 'lyrics_4',
	},
	{
		id: '9',
		name: 'Ambient Spaces',
		description: 'Ethereal soundscapes for deep meditation',
		createdAt: '2024-01-07T09:30:00Z',
		updatedAt: '2024-01-21T15:55:00Z',
		audioId: 'audio_9',
		assetIds: ['asset_7', 'asset_8'],
	},
	{
		id: '10',
		name: 'Country Roads',
		description: 'Heartfelt storytelling with twangy guitars',
		createdAt: '2024-01-14T11:45:00Z',
		updatedAt: '2024-01-23T14:10:00Z',
		audioId: 'audio_10',
		lyricsId: 'lyrics_5',
	},
	{
		id: '11',
		name: 'Techno Pulse',
		createdAt: '2024-01-09T13:20:00Z',
		updatedAt: '2024-01-17T16:30:00Z',
		audioId: 'audio_11',
	},
	{
		id: '12',
		name: 'Classical Romance',
		description: 'Elegant orchestral piece with romantic themes',
		createdAt: '2024-01-01T10:00:00Z',
		updatedAt: '2024-01-15T12:25:00Z',
		audioId: 'audio_12',
		assetIds: ['asset_9'],
	},
	{
		id: '13',
		name: 'Hip Hop Chronicles',
		description: 'Urban beats with powerful lyrical flow',
		createdAt: '2024-01-11T17:10:00Z',
		updatedAt: '2024-01-27T10:05:00Z',
		audioId: 'audio_13',
		lyricsId: 'lyrics_6',
		assetIds: ['asset_10', 'asset_11'],
	},
	{
		id: '14',
		name: 'Indie Folk',
		description: 'Intimate storytelling with organic instruments',
		createdAt: '2024-01-06T14:35:00Z',
		updatedAt: '2024-01-22T11:50:00Z',
		audioId: 'audio_14',
	},
	{
		id: '15',
		name: 'Electronic Voyage',
		description: 'Experimental electronic journey through space',
		createdAt: '2024-01-13T08:40:00Z',
		updatedAt: '2024-01-28T15:15:00Z',
		audioId: 'audio_15',
		assetIds: ['asset_12', 'asset_13', 'asset_14'],
	},
	{
		id: '16',
		name: 'Reggae Sunshine',
		createdAt: '2024-01-04T15:25:00Z',
		updatedAt: '2024-01-14T09:40:00Z',
		audioId: 'audio_16',
	},
	{
		id: '17',
		name: 'Orchestral Epic',
		description: 'Grand cinematic composition with full orchestra',
		createdAt: '2024-01-17T12:50:00Z',
		updatedAt: '2024-01-29T14:35:00Z',
		audioId: 'audio_17',
		assetIds: ['asset_15'],
	},
	{
		id: '18',
		name: 'Lofi Study',
		description: 'Relaxing beats perfect for concentration',
		createdAt: '2024-01-02T16:20:00Z',
		updatedAt: '2024-01-13T17:25:00Z',
		audioId: 'audio_18',
	},
	{
		id: '19',
		name: 'Rock Anthem',
		description: 'High-energy rock with stadium-worthy choruses',
		createdAt: '2024-01-16T11:15:00Z',
		updatedAt: '2024-01-30T12:45:00Z',
		audioId: 'audio_19',
		lyricsId: 'lyrics_7',
		assetIds: ['asset_16', 'asset_17'],
	},
	{
		id: '20',
		name: 'Experimental Noise',
		createdAt: '2024-01-19T13:55:00Z',
		updatedAt: '2024-01-25T16:20:00Z',
		audioId: 'audio_20',
	},
];

export const ProjectsDrawer = memo(() => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline" size="icon" className="h-9 w-9">
					<FolderOpen className="h-4 w-4" />
					<span className="sr-only">Open projects</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent className="max-h-[80vh]">
				<DrawerHeader>
					<DrawerTitle>Projects</DrawerTitle>
					<DrawerDescription>
						Select a project to continue working on.
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex-1 overflow-y-auto p-4">
					{mockProjects.length > 0 ? (
						<div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
							{mockProjects.map((project) => (
								<Card
									key={project.id}
									className="hover:shadow-none shadow-none transition-all duration-200 cursor-pointer group h-full flex flex-col"
								>
									<CardHeader className="flex-shrink-0">
										<div className="flex items-center gap-6">
											<div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
												{project.name
													.charAt(0)
													.toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<CardTitle className="text-sm truncate leading-tight">
													{project.name}
												</CardTitle>
												<span className="text-xs text-muted-foreground">
													{formatDate(
														project.updatedAt
													)}
												</span>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-0 flex-1 flex flex-col justify-start">
										<CardDescription className="text-xs line-clamp-2 leading-relaxed min-h-[2.5rem] flex items-start">
											{project.description || ''}
										</CardDescription>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
								<FolderOpen className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="text-muted-foreground text-sm">
								No projects yet. Create your first project to
								get started.
							</p>
						</div>
					)}
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
});
