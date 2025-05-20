import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
	// Import the API functions
	uploadAudioFile,
	separateAudio,
	separateYoutubeAudio,
	notifications,
	type SeparationResponse,
} from '@/data/api';
import { AudioUploadCard } from '@/components/audio-upload-card';
import { OutputTracksCard } from '@/components/output-tracks-card';
import { AudioYoutubeCard } from '@/components/audio-youtube-card';
import { Tabs } from '@/components/tabs';

import { type VideoMetadata } from '@/types/video';
import { isValidYoutubeUrl, extractVideoId } from '@/lib/utils';

export const Route = createFileRoute('/')({
	component: App,
});

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [uploadedFileName, setUploadedFileName] = useState<string | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
	const [separationResponse, setSeparationResponse] =
		useState<SeparationResponse | null>(null);
	const [youtubeUrl, setYoutubeUrl] = useState('');
	const [isUrlValid, setIsUrlValid] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [validationMessage, setValidationMessage] = useState('');
	const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
		null
	);

	// File upload mutation
	const uploadMutation = useMutation({
		mutationFn: uploadAudioFile,
		onSuccess: (data) => {
			setUploadedFileName(data.file.storedFilename);
			notifications.uploadSuccess(data.file.originalFilename);
		},
		onError: (error) => {
			notifications.uploadError(error as Error);
		},
	});

	// Separation mutation
	const separateMutation = useMutation({
		mutationFn: separateAudio,
		onSuccess: (data) => {
			setSeparationResponse(data);
			notifications.separationSuccess();
		},
		onError: (error) => {
			console.error('Separation error:', error);
			notifications.separationError(error as Error);
		},
		retry: false,
	});

	// YouTube separation mutation
	const separateYoutubeMutation = useMutation({
		mutationFn: separateYoutubeAudio,
		onSuccess: (data) => {
			setSeparationResponse(data);
			notifications.youtubeSeparationSuccess();
		},
		onError: (error) => {
			console.error('YouTube separation error:', error);
			notifications.youtubeSeparationError(error as Error);
		},
		retry: false,
	});

	// Check if YouTube video exists and fetch metadata
	const checkVideoExists = async (videoId: string): Promise<boolean> => {
		try {
			const response = await fetch(
				`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
			);

			if (response.ok) {
				const data = await response.json();
				setVideoMetadata(data);
				return true;
			}
			setVideoMetadata(null);
			return false;
		} catch (error) {
			console.error('Error checking YouTube video:', error);
			setVideoMetadata(null);
			return false;
		}
	};

	const validateYoutubeUrl = async (url: string) => {
		if (!isValidYoutubeUrl(url)) {
			setIsUrlValid(false);
			setValidationMessage('Please enter a valid YouTube URL');
			setVideoMetadata(null);
			return;
		}

		const videoId = extractVideoId(url);
		if (!videoId) {
			setIsUrlValid(false);
			setValidationMessage('Could not extract video ID from URL');
			setVideoMetadata(null);
			return;
		}

		const exists = await checkVideoExists(videoId);
		if (!exists) {
			setIsUrlValid(false);
			setValidationMessage(
				'This YouTube video is unavailable or private'
			);
			return;
		}

		setIsUrlValid(true);
		setValidationMessage('Valid YouTube URL! Ready to separate audio.');
	};

	const handleYoutubeUrlChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const newUrl = event.target.value;
		setYoutubeUrl(newUrl);

		if (newUrl) {
			setIsValidating(true);
			setValidationMessage('');
			setVideoMetadata(null);

			const timer = setTimeout(async () => {
				await validateYoutubeUrl(newUrl);
				setIsValidating(false);
			}, 500);

			return () => clearTimeout(timer);
		} else {
			setIsUrlValid(false);
			setIsValidating(false);
			setValidationMessage('');
			setVideoMetadata(null);
		}
	};

	// Handle YouTube separation
	const handleSeparateYoutube = (url: string) => {
		notifications.youtubeSeparationStart();
		separateYoutubeMutation.mutate(url);
	};

	// Handle file selection
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			setAudioUrl(URL.createObjectURL(selectedFile));
		}
	};

	// Handle file upload
	const handleUpload = () => {
		if (file) {
			uploadMutation.mutate(file);
		}
	};

	// Handle separation
	const handleSeparate = () => {
		if (uploadedFileName) {
			separateMutation.mutate(uploadedFileName);
		}
	};

	// Reset state
	const resetState = () => {
		separateMutation.reset();
		separateYoutubeMutation.reset();
		uploadMutation.reset();
		setFile(null);
		setAudioUrl(null);
		setUploadedFileName(null);
		setSeparationResponse(null);
		setYoutubeUrl('');
		setIsUrlValid(false);
		setIsValidating(false);
		setValidationMessage('');
		setVideoMetadata(null);
	};

	// Handle tab change with separation pending check
	const handleTabChange = (tab: 'upload' | 'youtube') => {
		if (!separateMutation.isPending && !separateYoutubeMutation.isPending) {
			setActiveTab(tab);
		}
	};

	return (
		<div className="flex-1 py-10">
			<Tabs
				activeTab={activeTab}
				onTabChange={handleTabChange}
				isDisabled={
					separateMutation.isPending ||
					separateYoutubeMutation.isPending
				}
			/>

			<div className="grid gap-8 md:grid-cols-2">
				{activeTab === 'upload' ? (
					<AudioUploadCard
						file={file}
						audioUrl={audioUrl}
						uploadedFileName={uploadedFileName}
						uploadMutation={uploadMutation}
						separateMutation={separateMutation}
						handleFileChange={handleFileChange}
						handleUpload={handleUpload}
						handleSeparate={handleSeparate}
					/>
				) : (
					<AudioYoutubeCard
						separationResponse={separationResponse}
						separateYoutubeMutation={separateYoutubeMutation}
						handleSeparateYoutube={handleSeparateYoutube}
						youtubeUrl={youtubeUrl}
						isUrlValid={isUrlValid}
						isValidating={isValidating}
						validationMessage={validationMessage}
						videoMetadata={videoMetadata}
						handleUrlChange={handleYoutubeUrlChange}
					/>
				)}

				<OutputTracksCard
					separationResponse={separationResponse}
					separateMutation={separateMutation}
					separateYoutubeMutation={separateYoutubeMutation}
					resetState={resetState}
				/>
			</div>
		</div>
	);
}
