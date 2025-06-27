import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import RenderWhen from './render-when';

type ActionButtonsProps = {
	file: File | null;
	uploadedFileName: string | null;
	uploadMutation: any;
	separateMutation: any;
	handleUpload: () => void;
	handleSeparate: () => void;
};

export function ActionButtons({
	file,
	uploadedFileName,
	uploadMutation,
	separateMutation,
	handleUpload,
	handleSeparate,
}: ActionButtonsProps) {
	const mutations = [uploadMutation, separateMutation];
	const isAnyMutationActive = mutations.some(
		(mutation) => mutation.isPending || mutation.isSuccess
	);

	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={handleUpload}
				disabled={!file || isAnyMutationActive}
				className="w-full"
				variant="default"
			>
				<RenderWhen
					condition={uploadMutation.isPending}
					fallback="Upload Audio"
				>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Uploading...
				</RenderWhen>
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
				<RenderWhen
					condition={separateMutation.isPending}
					fallback="Separate Vocals"
				>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Separating...
				</RenderWhen>
			</Button>
		</div>
	);
}
