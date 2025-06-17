import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for output files
app.use('/output', express.static(path.join(__dirname, '..', 'output')));

// Render endpoint
app.post('/render', async (req: Request, res: Response): Promise<void> => {
	try {
		const { compositionId, inputProps, outputFileName, totalFrames } =
			req.body;

		if (!compositionId) {
			res.status(400).json({ error: 'compositionId is required' });
			return;
		}

		// Create bundle
		const bundleLocation = await bundle({
			entryPoint: path.resolve('../../apps/client/src/remotion/index.ts'),
			onProgress: (progress) => {
				console.log(`Bundling progress: ${progress.toFixed(2)}%`);
			},
		});

		// Get composition
		const selectedComposition = await selectComposition({
			serveUrl: bundleLocation,
			id: compositionId,
			inputProps: inputProps || {},
		});

		// Generate output file name
		const fileName = outputFileName || `${compositionId}-${Date.now()}.mp4`;
		const outputPath = path.join(__dirname, '..', 'output', fileName);

		// Render video
		await renderMedia({
			composition: {
				...selectedComposition,
				fps: 30,
				durationInFrames: totalFrames,
				width: 1280,
				height: 720,
			},
			serveUrl: bundleLocation,
			codec: 'h264',
			outputLocation: outputPath,
			inputProps: inputProps || {},
			onProgress: (progress) => {
				console.log(`Progress: ${progress.progress.toFixed(2)}%`);
			},
		});

		res.json({
			success: true,
			message: 'Render completed',
			fileName,
			downloadUrl: `/output/${fileName}`,
		});
	} catch (error) {
		console.error('Render error:', error);
		res.status(500).json({
			error: 'Render failed',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

// Start server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
