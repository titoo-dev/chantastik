import { useUpdateProject } from '@/hooks/use-update-project';
import { useAppStore } from '@/stores/app/store';
import { createContext, useEffect, useRef, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface UpdateProjectContextType {
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	isSuccess: boolean;
	manualUpdate: () => void;
	reset: () => void;
}

export const UpdateProjectContext = createContext<
	UpdateProjectContextType | undefined
>(undefined);

interface UpdateProjectProviderProps {
	children: ReactNode;
}

export function UpdateProjectProvider({
	children,
}: UpdateProjectProviderProps) {
	const { isValidLyricLines } = useAppStore.getState();

	const { lyricLines, projectId } = useAppStore(
		useShallow((state) => ({
			lyricLines: state.lyricLines,
			projectId: state.projectId,
		}))
	);

	const intervalRef = useRef<number | null>(null);

	const mutation = useUpdateProject();

	const validateAndUpdateProject = () => {
		// Data validation
		if (!projectId) return;
		if (!isValidLyricLines()) return;
		if (lyricLines.length === 0) return;

		// Validate lyric lines structure
		const validLines = lyricLines.filter(
			(line) =>
				line.text &&
				line.text.trim() !== '' &&
				typeof line.timestamp === 'number' &&
				line.timestamp >= 0
		);

		if (validLines.length === 0) return;

		// Generate text from lyric lines
		const text = validLines.map((line) => line.text).join('\n');

		mutation.mutate({
			id: projectId,
			updates: {
				text,
				lines: validLines,
			},
		});
	};

	useEffect(() => {
		if (projectId) {
			// Start auto-update interval
			intervalRef.current = setInterval(validateAndUpdateProject, 15000);

			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
			};
		}
	}, [projectId, lyricLines]);

	// Manual update function
	const manualUpdate = () => {
		validateAndUpdateProject();
	};

	const contextValue: UpdateProjectContextType = {
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
		isSuccess: mutation.isSuccess,
		manualUpdate,
		reset: mutation.reset,
	};

	return (
		<UpdateProjectContext.Provider value={contextValue}>
			{children}
		</UpdateProjectContext.Provider>
	);
}
