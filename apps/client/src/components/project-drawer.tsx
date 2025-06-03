import { memo, useRef } from 'react';
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
import { FolderOpen, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle } from './ui/card';
import { useGetProjects } from '@/hooks/use-get-projects';
import { ProjectListSkeleton } from './project-list-skeleton';
import { getCoverArtUrl, type Project } from '@/data/api';
import { ScrollArea } from './ui/scroll-area';

interface ProjectsDrawerProps {
	onProjectSelected: (project: Project) => void;
	onDeleteProject: (projectId: string) => void;
}

export const ProjectsDrawer = memo<ProjectsDrawerProps>(
	({ onProjectSelected, onDeleteProject }) => {
		const {
			data: projects,
			isLoading,
			error,
		} = useGetProjects({ enabled: true });
		const closeRef = useRef<HTMLButtonElement>(null);

		const handleProjectSelect = (project: Project) => {
			onProjectSelected(project);
			closeRef.current?.click();
		};

		const handleProjectDelete = (projectId: string) => {
			onDeleteProject(projectId);
			if (closeRef.current) {
				closeRef.current.click();
			}
		};

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
					<ScrollArea className="h-[70vh] w-full p-4">
						{isLoading ? (
							<ProjectListSkeleton />
						) : error ? (
							<div className="text-center py-12">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
									<FolderOpen className="h-6 w-6 text-destructive" />
								</div>
								<p className="text-destructive text-sm">
									Failed to load projects. Please try again.
								</p>
							</div>
						) : projects && projects.length > 0 ? (
							<div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
								{projects.map((project) => (
									<Card
										key={project.id}
										className="hover:shadow-none shadow-none transition-all duration-200 cursor-pointer group h-full flex flex-col relative"
										onClick={() =>
											handleProjectSelect(project)
										}
									>
										<Button
											variant="outline"
											size="icon"
											className="absolute bottom-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
											onClick={(e) => {
												e.stopPropagation();
												handleProjectDelete(project.id);
											}}
										>
											<Trash2 className="h-9 w-9" />
											<span className="sr-only">
												Delete project
											</span>
										</Button>
										<CardHeader className="flex-shrink-0">
											<div className="flex items-center gap-6">
												<div className="w-20 h-20 rounded-lg overflow-hidden">
													<img
														src={getCoverArtUrl(
															project.audioId
														)}
														alt={`Cover art for ${project.name}`}
														className="w-full h-full object-cover"
														onError={(e) => {
															// Fallback to initials if image fails to load
															const target =
																e.target as HTMLImageElement;
															target.style.display =
																'none';
															const fallback =
																target.nextElementSibling as HTMLElement;
															if (fallback)
																fallback.style.display =
																	'flex';
														}}
													/>
													<div
														className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm"
														style={{
															display: 'none',
														}}
													>
														{project.name
															.charAt(0)
															.toUpperCase()}
													</div>
												</div>
												<div className="flex-1 min-w-0">
													<CardTitle className="text-sm leading-tight break-words">
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
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
									<FolderOpen className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-sm">
									No projects yet. Create your first project
									to get started.
								</p>
							</div>
						)}
					</ScrollArea>
					<DrawerFooter>
						<DrawerClose asChild>
							<Button ref={closeRef} variant="outline">
								Close
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}
);
