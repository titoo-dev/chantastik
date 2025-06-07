import { Link } from '@tanstack/react-router';
import { AudioWaveform, Search } from 'lucide-react';
import { memo, useState } from 'react';
import { ProjectsDrawer } from './project-drawer';
import { type Project } from '@/data/api';
import { useDeleteProject } from '@/hooks/use-delete-project';
import { ThemeModeToggle } from './theme-mode-toggle';
import { Input } from './ui/input';
import { createDeleteConfirmationDialog } from './dialogs/confirmation-dialog';
import { useAppStore } from '@/stores/app/store';

export const Header = memo(() => {
	const { setAudio } = useAppStore.getState();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
	const deleteProjectMutation = useDeleteProject({
		onSuccess: () => {
			setShowDeleteDialog(false);
			setProjectToDelete(null);
		},
	});

	const handleProjectSelected = (project: Project) => {
		console.log('Selected project:', project);
		setAudio({
			id: project.audioId,
		});
	};

	const handleProjectDelete = (projectId: string) => {
		console.log('Delete project with ID:', projectId);
		setProjectToDelete(projectId);
		setShowDeleteDialog(true);
	};

	const confirmDelete = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (projectToDelete) {
			deleteProjectMutation.mutate(projectToDelete);
		}
	};

	const cancelDelete = () => {
		setShowDeleteDialog(false);
		setProjectToDelete(null);
	};

	return (
		<>
			<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
				<div className="container mx-auto flex h-16 items-center justify-between relative">
					<div className="flex items-center gap-2">
						<AudioWaveform className="h-6 w-6 text-primary" />
						<h1 className="text-xl font-bold text-foreground">
							<Link to="/">Karaoke Milay</Link>
						</h1>
					</div>

					{/* Search bar for medium and larger screens */}
					<div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 max-w-xs lg:max-w-md w-full px-4">
						<div className="relative">
							<Input
								type="text"
								placeholder="Search available lyrics..."
								className="w-full h-10 pr-10"
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
								<Search className="h-4 w-4 text-muted-foreground" />
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						{/* Search icon for small screens */}
						<Search className="h-5 w-5 text-muted-foreground md:hidden cursor-pointer hover:text-foreground transition-colors" />

						<ProjectsDrawer
							onProjectSelected={handleProjectSelected}
							onDeleteProject={handleProjectDelete}
						/>
						<ThemeModeToggle />
						<div className="hidden sm:block text-sm text-muted-foreground">
							made by{' '}
							<a
								href="https://github.com/titoo-dev"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-primary hover:text-primary/80 transition-colors underline decoration-dotted underline-offset-4 hover:decoration-solid"
							>
								titoo-dev
							</a>
						</div>
					</div>
				</div>
			</header>

			{createDeleteConfirmationDialog({
				open: showDeleteDialog,
				onOpenChange: setShowDeleteDialog,
				onConfirm: confirmDelete,
				onCancel: cancelDelete,
				isLoading: deleteProjectMutation.isPending,
				itemName: 'project',
			})}
		</>
	);
});
