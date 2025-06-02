import { Link } from '@tanstack/react-router';
import { AudioWaveform } from 'lucide-react';
import { memo } from 'react';
import { ProjectsDrawer } from './project-drawer';
import { useAppContext } from '@/hooks/use-app-context';
import type { Project } from '@/data/api';

export const Header = memo(() => {
	const { updateAudioId } = useAppContext();

	const handleProjectSelected = (project: Project) => {
		console.log('Selected project:', project);
		updateAudioId(project.audioId);
	};

	return (
		<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
			<div className="container mx-auto flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<AudioWaveform className="h-6 w-6 text-primary" />
					<h1 className="text-xl font-bold text-foreground">
						<Link to="/">Karaoke Milay</Link>
					</h1>
				</div>
				<ProjectsDrawer onProjectSelected={handleProjectSelected} />
			</div>
		</header>
	);
});
