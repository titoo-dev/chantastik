import { Link } from '@tanstack/react-router';
import { AudioWaveform, FolderOpen } from 'lucide-react';
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
import { Button } from './ui/button';

const ProjectsDrawer = memo(() => {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline" size="icon" className="h-9 w-9">
					<FolderOpen className="h-4 w-4" />
					<span className="sr-only">Open projects</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Projects</DrawerTitle>
					<DrawerDescription>
						Select a project to continue working on.
					</DrawerDescription>
				</DrawerHeader>
				<div className="p-4">
					<p className="text-muted-foreground">
						Your projects will appear here.
					</p>
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

export const Header = memo(() => {
	return (
		<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
			<div className="container mx-auto flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<AudioWaveform className="h-6 w-6 text-primary" />
					<h1 className="text-xl font-bold text-foreground">
						<Link to="/">Karaoke Milay</Link>
					</h1>
				</div>
				<ProjectsDrawer />
			</div>
		</header>
	);
});
