import { toast } from 'sonner';
import type { AudioMeta } from './types';
import { QueryClient } from '@tanstack/react-query';

// API base URL - adjust based on your environment
export const AUDIO_BASE_URL =
	import.meta.env.VITE_DEFAULT_REST_API_URL ||
	'https://mp3-uploader.dev-titosy.workers.dev';

export const PROJECT_BASE_URL =
	import.meta.env.VITE_DEFAULT_PROJECT_API_URL ||
	'https://karaoke-milay-project.dev-titosy.workers.dev';

type Response = {
	message: string;
	id: string;
};

export type Project = {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	audioId: string;
};

export const queryClient = new QueryClient();

// get all projects function
export async function getAllProjects(): Promise<Project[]> {
	try {
		const response = await fetch(`${PROJECT_BASE_URL}/projects`);

		if (!response.ok) {
			throw new Error('Failed to fetch projects');
		}

		const data: Project[] = await response.json();
		return data;
	} catch (error) {
		toast.error('Projects fetch failed', {
			description:
				error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}

// get audio metadata function
export async function getAudioMetadata(id: string): Promise<AudioMeta> {
	try {
		const response = await fetch(`${AUDIO_BASE_URL}/audio/${id}/meta`);

		if (!response.ok) {
			throw new Error('Failed to fetch audio metadata');
		}

		const data: AudioMeta = await response.json();
		return data;
	} catch (error) {
		toast.error('Metadata fetch failed', {
			description:
				error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}

// get audio url function
export function getAudioUrl(id: string): string {
	return `${AUDIO_BASE_URL}/audio/${id}`;
}

// get cover art url function
export function getCoverArtUrl(id: string): string {
	return `${AUDIO_BASE_URL}/audio/${id}/cover`;
}

/**
 * Uploads an audio file to the server
 */
export async function uploadAudioFile(file: File): Promise<Response> {
	const formData = new FormData();
	formData.append('audio', file);

	const response = await fetch(`${AUDIO_BASE_URL}/audio`, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Upload failed');
	}

	return response.json();
}

/**
 * Downloads a remote audio file
 * @param url URL of the audio file to download
 * @param filename Name to save the file as
 */
export async function downloadAudioFile(url: string): Promise<void> {
	try {
		// Fetch the file
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to download file');
		}

		// Get the blob from the response
		const blob = await response.blob();

		// Extract filename from the path
		const filename = url.split('/').pop() || 'download';

		// Create a temporary download link
		const downloadUrl = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = downloadUrl;
		link.download = filename;

		// Trigger download and clean up
		document.body.appendChild(link);
		link.click();
		window.URL.revokeObjectURL(downloadUrl);
		document.body.removeChild(link);

		toast.success('Download started', {
			description: `Downloading ${filename}`,
		});
	} catch (error) {
		toast.error('Download failed', {
			description:
				error instanceof Error ? error.message : 'Unknown error',
		});
		throw error;
	}
}

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
