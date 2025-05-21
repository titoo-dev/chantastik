import { Request, Response } from 'express';
import { fileService } from '../services';
import { MulterFile } from '../types';

export const uploadController = {
	/**
	 * Handle file upload
	 */
	uploadFile: async (req: Request, res: Response) => {
		try {
			if (!req.file) {
				return res.status(400).json({ error: 'No file uploaded' });
			}

			const file = req.file as MulterFile;

			// Extract metadata using music-metadata
			const metadata = await fileService.extractMetadata(file.path);

			// Handle cover art if it exists
			let coverArt = null;

			if (
				metadata?.common?.picture &&
				metadata.common.picture.length > 0
			) {
				coverArt = await fileService.saveCoverArt(
					metadata.common.picture[0],
					file.filename
				);
			}

			// Send file information and metadata to client
			return res.status(200).json({
				message: 'File uploaded successfully',
				file: fileService.getFileInfo(file),
				metadata: {
					title: metadata?.common?.title || null,
					artist: metadata?.common?.artist || null,
					album: metadata?.common?.album || null,
					year: metadata?.common?.year || null,
					genre: metadata?.common?.genre || null,
					duration: metadata?.format?.duration || null,
					coverArt,
				},
			});
		} catch (error) {
			console.error('Upload error:', error);
			return res.status(500).json({
				error: 'An error occurred during upload',
			});
		}
	},
};
