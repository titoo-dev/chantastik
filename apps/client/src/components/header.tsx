import { Link } from '@tanstack/react-router';
import { AudioWaveform } from 'lucide-react';
import { memo, useState } from 'react';
import { ProjectsDrawer } from './project-drawer';
import { useAppContext } from '@/hooks/use-app-context';
import type { Project } from '@/data/api';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog';

export const Header = memo(() => {
	const { updateAudioId } = useAppContext();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

	const handleProjectSelected = (project: Project) => {
		console.log('Selected project:', project);
		updateAudioId(project.audioId);
	};

	const handleProjectDelete = (projectId: string) => {
		console.log('Delete project with ID:', projectId);
		setProjectToDelete(projectId);
		setShowDeleteDialog(true);
	};

	const confirmDelete = () => {
		if (projectToDelete) {
			// Implement deletion logic here
			console.log('Confirming deletion of project:', projectToDelete);
		}
		setShowDeleteDialog(false);
		setProjectToDelete(null);
	};

	const cancelDelete = () => {
		setShowDeleteDialog(false);
		setProjectToDelete(null);
	};

	return (
		<>
			<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
				<div className="container mx-auto flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<AudioWaveform className="h-6 w-6 text-primary" />
						<h1 className="text-xl font-bold text-foreground">
							<Link to="/">Karaoke Milay</Link>
						</h1>
					</div>
					<ProjectsDrawer
						onProjectSelected={handleProjectSelected}
						onDeleteProject={handleProjectDelete}
					/>
				</div>
			</header>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete project?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete the project and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelDelete}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-background hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
});
