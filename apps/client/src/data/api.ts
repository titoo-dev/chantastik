import { toast } from 'sonner';

// API base URL - adjust based on your environment
export const BASE_URL =
	import.meta.env.VITE_DEFAULT_REST_API_URL ||
	'https://mp3-uploader.dev-titosy.workers.dev';

type UploadResponse = {
	message: string;
	id: string;
};

// get audio url function
export function getAudioUrl(id: string): string {
	return `${BASE_URL}/audio/${id}`;
}

/**
 * Uploads an audio file to the server
 */
export async function uploadAudioFile(file: File): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append('audio', file);

	const response = await fetch(`${BASE_URL}/audio`, {
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

	uploadError: (error: Error) => {
		toast.error('Upload failed', {
			description: error.message,
		});
	},
};
