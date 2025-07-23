import type { Project } from "@/data/api";
import { useAppStore } from "@/stores/app/store";
import { useState } from "react";
import { useDeleteProject } from "./use-delete-project";

type UseHeaderProjectActionsReturn = {
    handleProjectSelected: (project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
    confirmDelete: (e: { preventDefault: () => void }) => void;
    cancelDelete: () => void;
    showDeleteDialog: boolean;
    projectToDelete: string | null;
    isDeleting: boolean;
};

export const useHeaderProjectActions = (): UseHeaderProjectActionsReturn => {
	const { setAudio, updateProjectId } = useAppStore.getState();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

	const deleteProjectMutation = useDeleteProject({
		onSuccess: () => {
			setShowDeleteDialog(false);
			setProjectToDelete(null);
		},
	});

	const handleProjectSelected = (project: Project) => {
		updateProjectId(project.id);
		if (project.audioId.includes('youtube')) {
			setAudio({
				id: project.audioId,
			});
		} else {
			setAudio({id: project.audioId});
		}
	};

	const handleProjectDelete = (projectId: string) => {
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

	return {
		handleProjectSelected,
		handleProjectDelete,
		confirmDelete,
		cancelDelete,
		showDeleteDialog,
		projectToDelete,
		isDeleting: deleteProjectMutation.isPending,
	};
};
