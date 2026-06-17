import { z } from 'zod';

/**
 * Schémas Zod = garde-frontière de la couche application. Les adapters
 * primaires (Route Handlers Next) parsent les entrées non fiables avec ces
 * schémas AVANT d'appeler un use case : le domaine ne reçoit que du sûr.
 */

export const lyricLineSchema = z.object({
	id: z.number(),
	text: z.string(),
	timestamp: z.number().nonnegative().optional(),
	style: z
		.object({
			emphasis: z.boolean().optional(),
			volume: z.enum(['soft', 'normal', 'loud']).optional(),
			duration: z.number().positive().optional(),
		})
		.optional(),
});

export const createProjectSchema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().optional(),
});

export const saveLyricsSchema = z.object({
	text: z.string().default(''),
	lines: z.array(lyricLineSchema).default([]),
});

export const updateProjectSchema = z.object({
	name: z.string().min(1).max(120).optional(),
	description: z.string().optional(),
	metadata: z
		.object({
			tags: z.array(z.string()).optional(),
			category: z.string().optional(),
			link: z.string().url().optional(),
			public: z.boolean().optional(),
		})
		.optional(),
});

export const searchYoutubeSchema = z.object({
	q: z.string(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type SaveLyricsDto = z.infer<typeof saveLyricsSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
