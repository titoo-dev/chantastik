import { UpdateProjectContext } from '@/context/update-project-context';
import { useContext } from 'react';

export function useUpdateProjectContext() {
	const context = useContext(UpdateProjectContext);
	if (context === undefined) {
		throw new Error(
			'useUpdateProject must be used within an UpdateProjectProvider'
		);
	}
	return context;
}
