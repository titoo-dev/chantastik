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
import { FolderOpen, RefreshCw, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle } from './ui/card';
import { ProjectListSkeleton } from './project-list-skeleton';
import { getCoverArtUrl, type Project } from '@/data/api';
import { ScrollArea } from './ui/scroll-area';
import { useProjectDrawer } from '@/hooks/use-project-drawer';

interface ProjectsDrawerProps {
	onProjectSelected: (project: Project) => void;
	onDeleteProject: (projectId: string) => void;
}

// Atomic components
const ProjectCard = memo<{
	project: Project;
	onSelect: (project: Project) => void;
	onDelete: (projectId: string) => void;
	formatDate: (date: string) => string;
}>(({ project, onSelect, onDelete, formatDate }) => (
	<Card
		className="hover:shadow-none shadow-none transition-all duration-200 cursor-pointer group h-full flex flex-col relative"
		onClick={() => onSelect(project)}
	>
		<Button
			variant="outline"
			size="icon"
			className="absolute bottom-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
			onClick={(e) => {
				e.stopPropagation();
				onDelete(project.id);
			}}
		>
			<Trash2 className="h-9 w-9" />
			<span className="sr-only">Delete project</span>
		</Button>
		<CardHeader className="flex-shrink-0">
			<div className="flex items-center gap-6">
				<ProjectCoverArt project={project} />
				<ProjectInfo project={project} formatDate={formatDate} />
			</div>
		</CardHeader>
	</Card>
));

const ProjectCoverArt = memo<{ project: Project }>(({ project }) => (
	<div className="w-20 h-20 rounded-lg overflow-hidden">
		<img
			src={getCoverArtUrl(project.audioId)}
			alt={`Cover art for ${project.name}`}
			className="w-full h-full object-cover"
			onError={(e) => {
				const target = e.target as HTMLImageElement;
				target.style.display = 'none';
				const fallback = target.nextElementSibling as HTMLElement;
				if (fallback) fallback.style.display = 'flex';
			}}
		/>
		<div
			className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm"
			style={{ display: 'none' }}
		>
			{project.name.charAt(0).toUpperCase()}
		</div>
	</div>
));

const ProjectInfo = memo<{
	project: Project;
	formatDate: (date: string) => string;
}>(({ project, formatDate }) => (
	<div className="flex-1 min-w-0">
		<CardTitle className="text-sm leading-tight break-words">
			{project.name}
		</CardTitle>
		<span className="text-xs text-muted-foreground">
			{formatDate(project.updatedAt)}
		</span>
	</div>
));

const EmptyState = memo(() => (
	<div className="text-center py-12">
		<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
			<FolderOpen className="h-6 w-6 text-muted-foreground" />
		</div>
		<p className="text-muted-foreground text-sm">
			No projects yet. Create your first project to get started.
		</p>
	</div>
));

const ErrorState = memo(() => (
	<div className="text-center py-12">
		<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
			<FolderOpen className="h-6 w-6 text-destructive" />
		</div>
		<p className="text-destructive text-sm">
			Failed to load projects. Please try again.
		</p>
	</div>
));

const ProjectGrid = memo<{
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

// Main component
export const ProjectsDrawer = memo<ProjectsDrawerProps>(
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
			if (error) return <ErrorState />;
			if (projects && projects.length > 0) {
				return (
					<ProjectGrid
						projects={projects}
						onProjectSelect={handleProjectSelect}
						onProjectDelete={handleProjectDelete}
						formatDate={formatDate}
					/>
				);
			}
			return <EmptyState />;
		};
		return (
			<Drawer>
				<DrawerTrigger asChild>
					<Button
						data-onboarding="projects-drawer"
						variant="outline"
						size="icon"
						className="h-9 w-9"
					>
						<FolderOpen className="h-4 w-4" />
						<span className="sr-only">Open projects</span>
					</Button>
				</DrawerTrigger>
				<DrawerContent className="max-h-[80vh]">
					<DrawerHeader className="container mx-auto max-w-8xl px-0">
						<div className="flex items-center justify-between">
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
