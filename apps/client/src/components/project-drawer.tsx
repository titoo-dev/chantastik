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
import { FolderOpen, RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';
import { ProjectListSkeleton } from './project-list-skeleton';
import { type Project } from '@/data/api';
import { ScrollArea } from './ui/scroll-area';
import { useProjectDrawer } from '@/hooks/use-project-drawer';
import { ProjectCard } from './project-card';

type Props = {
	onProjectSelected: (project: Project) => void;
	onDeleteProject: (projectId: string) => void;
};

export const ProjectsDrawer = memo<Props>(
	({ onProjectSelected, onDeleteProject }) => {
		const {
			closeRef,
			projects,
			isLoading,
			isFetching,
			error,
			formatDate,
			handleProjectDelete,
			handleProjectSelect,
			refetch: reloadProjects,
		} = useProjectDrawer({
			onProjectSelected,
			onDeleteProject,
		});

		const renderContent = () => {
			if (isLoading || isFetching) return <ProjectListSkeleton />;
			if (error) return <Error />;
			if (projects && projects.length > 0) {
				return (
					<Grid
						projects={projects}
						onProjectSelect={handleProjectSelect}
						onProjectDelete={handleProjectDelete}
						formatDate={formatDate}
					/>
				);
			}
			return <Empty />;
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
					<DrawerHeader className="container mx-auto max-w-8xl px-0">
						<div className="flex items-center justify-between px-4 sm:px-0">
							<div>
								<DrawerTitle>Projects</DrawerTitle>
								<DrawerDescription>
									Select a project to continue working on.
								</DrawerDescription>
							</div>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9"
								onClick={() => reloadProjects()}
							>
								<RefreshCw className="h-4 w-4" />
								<span className="sr-only">Reload projects</span>
							</Button>
						</div>
					</DrawerHeader>
					<ScrollArea className="h-[60vh] w-full p-4">
						{renderContent()}
					</ScrollArea>
					<DrawerFooter className="flex pb-4 pt-0">
						<DrawerClose asChild>
							<Button
								ref={closeRef}
								variant="outline"
								size="icon"
								className="h-9 w-9 self-center"
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Close projects</span>
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}
);

const Empty = memo(() => (
	<div className="text-center py-12">
		<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
			<FolderOpen className="h-6 w-6 text-muted-foreground" />
		</div>
		<p className="text-muted-foreground text-sm">
			No projects yet. Create your first project to get started.
		</p>
	</div>
));

const Error = memo(() => (
	<div className="text-center py-12">
		<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
			<FolderOpen className="h-6 w-6 text-destructive" />
		</div>
		<p className="text-destructive text-sm">
			Failed to load projects. Please try again.
		</p>
	</div>
));

const Grid = memo<{
	projects: Project[];
	onProjectSelect: (project: Project) => void;
	onProjectDelete: (projectId: string) => void;
	formatDate: (date: string) => string;
}>(({ projects, onProjectSelect, onProjectDelete, formatDate }) => (
	<div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr container mx-auto max-w-8xl">
		{projects.map((project) => (
			<ProjectCard
				key={project.id}
				project={project}
				onSelect={onProjectSelect}
				onDelete={onProjectDelete}
				formatDate={formatDate}
			/>
		))}
	</div>
));