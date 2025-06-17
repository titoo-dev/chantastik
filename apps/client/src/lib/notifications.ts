import { toast } from 'sonner';

/**
 * Handles the notification display for API operations
 */
export const notifications = {
	uploadSuccess: (filename: string) => {
		toast.success('Upload successful', {
			description: `File ${filename} uploaded successfully.`,
		});
	},
	projectCreationSuccess: (projectId: string) => {
		toast.success('Project created', {
			description: `Project created successfully with ID: ${projectId}`,
		});
	},

	uploadError: (error: Error) => {
		toast.error('Upload failed', {
			description: error.message,
		});
	},
};
