import fs from 'fs';
import path from 'path';
import { appConfig } from '../config';
import { MulterFile } from '../types';
import { pathUtils } from '../utils';
import * as mm from 'music-metadata';

export class FileService {
	/**
	 * Validates if a file exists at the given path
	 */
	validateFileExists(filename: string): boolean {
		const inputPath = pathUtils.getInputPath(filename);
		return fs.existsSync(inputPath);
	}

	/**
	 * Ensures required directories exist
	 */
	ensureDirectoriesExist(): void {
		const dirs = [
			appConfig.storage.input,
			appConfig.storage.output,
			appConfig.storage.models,
			appConfig.storage.downloads,
			appConfig.storage.covers,
		];

		for (const dir of dirs) {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
		}
	}

	getDownloadFiles(): string[] {
		return fs
			.readdirSync(appConfig.storage.downloads)
			.map((filename) => ({
				name: filename,
				time: fs
					.statSync(`${appConfig.storage.downloads}/${filename}`)
					.mtime.getTime(),
			}))
			.sort((a, b) => b.time - a.time)
			.map((file) => file.name);
	}

	getLatestDownloadedFile(): string | null {
		const files = this.getDownloadFiles();
		return files.length > 0 ? files[0] : null;
	}

	/**
	 * Get file paths for processed audio files
	 */
	getProcessedFilePaths(filename: string) {
		return {
			vocals: pathUtils.getOutputUrl(filename, 'vocals'),
			instrumental: pathUtils.getOutputUrl(filename, 'no_vocals'),
		};
	}

	/**
	 * Check if processed files exist
	 */
	checkProcessedFilesExist(filename: string): boolean {
		const vocalsPath = pathUtils.getOutputPath(filename, 'vocals');
		const instPath = pathUtils.getOutputPath(filename, 'no_vocals');

		return fs.existsSync(vocalsPath) && fs.existsSync(instPath);
	}

	/**
	 * Get file information from a multer file
	 */
	getFileInfo(file: MulterFile) {
		return {
			name: file.originalname,
			size: file.size,
			mimetype: file.mimetype,
			storedFilename: file.filename,
		};
	}

	/**
	 * Move a file from downloads directory to input directory
	 */
	moveDownloadToInput(filename: string): string {
		const sourcePath = path.join(appConfig.storage.downloads, filename);
		const targetPath = path.join(appConfig.storage.input, filename);

		// If file already exists in input directory, don't copy it again
		if (fs.existsSync(targetPath)) {
			return filename;
		}

		// Copy file to input directory
		fs.copyFileSync(sourcePath, targetPath);

		return filename;
	}

	/**
	 * Extract metadata from an audio file
	 */
	async extractMetadata(filePath: string): Promise<mm.IAudioMetadata | null> {
		try {
			return await mm.parseFile(filePath);
		} catch (error) {
			console.error('Error extracting metadata:', error);
			return null;
		}
	}

	/**
	 * Save cover art from audio metadata
	 */
	async saveCoverArt(
		picture: mm.IPicture,
		audioFilename: string
	): Promise<string | null> {
		try {
			// Ensure covers directory exists
			if (!appConfig.storage.covers) {
				appConfig.storage.covers = path.join(
					appConfig.storage.base,
					'covers'
				);
			}

			if (!fs.existsSync(appConfig.storage.covers)) {
				fs.mkdirSync(appConfig.storage.covers, { recursive: true });
			}

			// Determine file extension based on format
			const fileExtension =
				picture.format.includes('jpeg') ||
				picture.format.includes('jpg')
					? 'jpg'
					: picture.format.includes('png')
						? 'png'
						: 'jpg';

			// Create filename for the cover art
			const coverFilename = `cover_${path.basename(audioFilename, path.extname(audioFilename))}.${fileExtension}`;
			const coverPath = path.join(
				appConfig.storage.covers,
				coverFilename
			);

			// Write the cover art to file
			fs.writeFileSync(coverPath, picture.data);

			// Return the URL or path to the cover art
			return `/covers/${coverFilename}`;
		} catch (error) {
			console.error('Error saving cover art:', error);
			return null;
		}
	}
}

export const fileService = new FileService();
