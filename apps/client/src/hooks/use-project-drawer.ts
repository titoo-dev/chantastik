import { useRef } from 'react';
import { useGetProjects } from '@/hooks/use-get-projects';
import { type Project } from '@/data/api';
import { useRemoveCurrentAudio } from './use-remove-current-audio';

interface UseProjectDrawerProps {
	onProjectSelected: (project: Project) => void;
	onDeleteProject: (projectId: string) => void;
}

export const useProjectDrawer = ({
	onProjectSelected,
	onDeleteProject,
}: UseProjectDrawerProps) => {
	const closeRef = useRef<HTMLButtonElement>(null);

	const { handleRemoveAudio } = useRemoveCurrentAudio();

	const {
		data: projects,
		isLoading,
		error,
		refetch,
		isFetching,
	} = useGetProjects({ enabled: true });

	const handleProjectSelect = (project: Project) => {
		handleRemoveAudio(); // Clear current audio when selecting a new project
		onProjectSelected(project);
		closeRef.current?.click();
	};

	const handleProjectDelete = (projectId: string) => {
		onDeleteProject(projectId);
		closeRef.current?.click();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return {
		projects,
		isLoading,
		error,
		closeRef,
		handleProjectSelect,
		handleProjectDelete,
		formatDate,
		refetch,
		isFetching,
	};
};
