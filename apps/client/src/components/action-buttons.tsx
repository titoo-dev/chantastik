import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export function ActionButtons({
	file,
	uploadedFileName,
	uploadMutation,
	separateMutation,
	handleUpload,
	handleSeparate,
}: {
	file: File | null;
	uploadedFileName: string | null;
	uploadMutation: any;
	separateMutation: any;
	handleUpload: () => void;
	handleSeparate: () => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={handleUpload}
				disabled={
					!file ||
					uploadMutation.isPending ||
					uploadMutation.isSuccess ||
					separateMutation.isPending ||
					separateMutation.isSuccess
				}
				className="w-full"
				variant="default"
			>
				{uploadMutation.isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Uploading...
					</>
				) : (
					<>Upload Audio</>
				)}
			</Button>

			<Button
				onClick={handleSeparate}
				disabled={
					!uploadedFileName ||
					separateMutation.isPending ||
					separateMutation.isSuccess
				}
				className="w-full"
				variant="secondary"
			>
				{separateMutation.isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Separating...
					</>
				) : (
					<>Separate Vocals</>
				)}
			</Button>
		</div>
	);
}
