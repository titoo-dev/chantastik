import { Link } from '@tanstack/react-router';
import { AudioWaveform } from 'lucide-react';
import { memo } from 'react';
import { ProjectsDrawer } from './project-drawer';
import { ThemeModeToggle } from './theme-mode-toggle';
import { createDeleteConfirmationDialog } from './dialogs/confirmation-dialog';
import { useHeaderProjectActions } from '@/hooks/use-header-project-actions';

const HeaderContent = memo(() => {
	const {
		handleProjectSelected,
		handleProjectDelete,
		confirmDelete,
		cancelDelete,
		showDeleteDialog,
		isDeleting,
	} = useHeaderProjectActions();

	return (
		<>
			<header className="px-4 sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
				<div className="container mx-auto flex h-16 items-center justify-between relative">
					<div className="flex items-center gap-2">
						<AudioWaveform className="h-6 w-6 text-primary" />
						<h1
							data-test-id="title"
							className="text-xl font-bold text-foreground"
						>
							<Link to="/">Chantastik</Link>
						</h1>
					</div>

					<div className="flex items-center gap-4">
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
				onOpenChange: (open) => !open && cancelDelete(),
				onConfirm: confirmDelete,
				onCancel: cancelDelete,
				isLoading: isDeleting,
				itemName: 'project',
			})}
		</>
	);
});

export const Header = memo(() => <HeaderContent />);
