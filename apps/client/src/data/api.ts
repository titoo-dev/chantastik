import { toast } from 'sonner';

// API base URL - adjust based on your environment
export const BASE_URL =
	import.meta.env.VITE_DEFAULT_REST_API_URL || 'http://localhost:8000/api';

type UploadResponse = {
	file: {
		originalFilename: string;
		storedFilename: string;
	};
};

export type SeparationResponse = {
	success?: boolean;
	message: string;
	files: {
		vocals?: string;
		instrumental?: string;
	};
	filename?: string;
};

/**
 * Uploads an audio file to the server
 */
export async function uploadAudioFile(file: File): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append('audio', file);

	const response = await fetch(`${BASE_URL}/upload`, {
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
 * Separates vocals from instrumental in the uploaded audio file
 */
export async function separateAudio(
	filename: string
): Promise<SeparationResponse> {
	const response = await fetch(`${BASE_URL}/audio/separate/${filename}`, {
		method: 'POST',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Separation failed');
	}

	return response.json();
}

/**
 * Separates vocals from instrumental from a YouTube URL
 */
export async function separateYoutubeAudio(
	youtubeUrl: string
): Promise<SeparationResponse> {
	const response = await fetch(`${BASE_URL}/audio/separate-youtube`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ url: youtubeUrl }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'YouTube audio separation failed');
	}

	return response.json();
}

/**
 * Gets the output file path for a specific track type
 */
export function getOutputPath(filePath?: string): string {
	if (!filePath) {
		return '';
	}
	return `${BASE_URL}/audio/${filePath}`;
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

	separationSuccess: () => {
		toast.success('Separation complete', {
			description:
				'Vocals and instrumental tracks are ready for download.',
		});
	},

	separationError: (error: Error) => {
		toast.error('Separation failed', {
			description: error.message,
		});
	},

	youtubeSeparationStart: () => {
		toast.info('Processing YouTube audio', {
			description: 'This may take a few minutes. Please wait...',
		});
	},

	youtubeSeparationSuccess: (videoTitle?: string) => {
		toast.success('YouTube audio separation complete', {
			description: videoTitle
				? `Successfully processed "${videoTitle}". Tracks are ready for download.`
				: 'Vocals and instrumental tracks are ready for download.',
		});
	},

	youtubeSeparationError: (error: Error) => {
		toast.error('YouTube separation failed', {
			description: error.message,
		});
	},
};
