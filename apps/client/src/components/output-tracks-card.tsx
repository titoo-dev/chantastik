import { AudioWaveform } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { EmptyOutputState } from './empty-output-state';
import { ProcessingIndicator } from './progress-indicator';
import { OutputTracks } from './output-tracks';
import type { SeparationResponse } from '@/data/api';

export function OutputTracksCard({
	separationResponse,
	separateMutation,
	separateYoutubeMutation,
	resetState,
}: {
	separationResponse: SeparationResponse | null;
	separateMutation: any;
	separateYoutubeMutation: any;
	resetState: () => void;
}) {
	const isSuccess =
		separateMutation.isSuccess || separateYoutubeMutation?.isSuccess;

	const isProcessing =
		separateMutation.isPending || separateYoutubeMutation.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AudioWaveform className="h-5 w-5 text-primary" />
					Output Tracks
				</CardTitle>
				<CardDescription>
					Download the separated vocal and instrumental tracks
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{isProcessing && <ProcessingIndicator />}

				{isSuccess && separationResponse && (
					<OutputTracks
						vocalOutputPath={separationResponse.files.vocals}
						instrumentalOutputPath={
							separationResponse.files.instrumental
						}
						resetState={resetState}
					/>
				)}

				{separationResponse === null && !isProcessing && !isSuccess && (
					<EmptyOutputState />
				)}
			</CardContent>
		</Card>
	);
}
