import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle } from './ui/card';
import { memo } from 'react';
import { getCoverArtUrl, type Project } from '@/data/api';

const CoverArt = memo<{ project: Project }>(({ project }) => {
	const onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const target = e.target as HTMLImageElement;
		target.style.display = 'none';
		const fallback = target.nextElementSibling as HTMLElement;
		if (fallback) fallback.style.display = 'flex';
	};

	return (
		<div className="w-20 h-20 rounded-lg overflow-hidden">
			<img
				src={getCoverArtUrl(project.audioId)}
				alt={`Cover art for ${project.name}`}
				className="w-full h-full object-cover"
				onError={onError}
			/>
			<div
				className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm"
				style={{ display: 'none' }}
			>
				{project.name.charAt(0).toUpperCase()}
			</div>
		</div>
	);
});

const Info = memo<{
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

export const ProjectCard = memo<{
	project: Project;
	onSelect: (project: Project) => void;
	onDelete: (projectId: string) => void;
	formatDate: (date: string) => string;
}>(({ project, onSelect, onDelete, formatDate }) => {
    
    const handleTrashClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onDelete(project.id);
    };
    
    return (
		<Card
			className="hover:shadow-none shadow-none transition-all duration-200 cursor-pointer group h-full flex flex-col relative"
			onClick={() => onSelect(project)}
			data-testid="project-card"
		>
			<Button
				variant="outline"
				size="icon"
				className="absolute bottom-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
				onClick={handleTrashClick}
				data-testid="delete-project-button"
				aria-label='Delete project'
			>
				<Trash2 className="h-9 w-9" />
				<span className="sr-only">Delete project</span>
			</Button>
			<CardHeader className="flex-shrink-0" data-testid="project-card-header">
				<div className="flex items-center gap-6" data-testid="project-card-content">
					<CoverArt project={project} />
					<Info project={project} formatDate={formatDate} />
				</div>
			</CardHeader>
		</Card>
    );
});
