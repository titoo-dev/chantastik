import { Upload } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { DropZone } from './drop-zone';
import { FileDetails } from './file-details';
import { AudioPreview } from './audio-preview';
import { ActionButtons } from './action-buttons';

export function AudioUploadCard({
	file,
	audioUrl,
	uploadedFileName,
	uploadMutation,
	separateMutation,
	handleFileChange,
	handleUpload,
	handleSeparate,
}: {
	file: File | null;
	audioUrl: string | null;
	uploadedFileName: string | null;
	uploadMutation: any;
	separateMutation: any;
	handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleUpload: () => void;
	handleSeparate: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Upload className="h-5 w-5 text-primary" />
					Upload Audio
				</CardTitle>
				<CardDescription>
					Upload your audio file to separate vocals from instruments
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<DropZone file={file} handleFileChange={handleFileChange} />

				{file && <FileDetails file={file} />}

				{audioUrl && <AudioPreview audioUrl={audioUrl} />}

				<ActionButtons
					file={file}
					uploadedFileName={uploadedFileName}
					uploadMutation={uploadMutation}
					separateMutation={separateMutation}
					handleUpload={handleUpload}
					handleSeparate={handleSeparate}
				/>
			</CardContent>
		</Card>
	);
}
