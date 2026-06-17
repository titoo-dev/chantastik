import {
	NotFoundError,
	assertValidProjectName,
	err,
	ok,
	ValidationError,
	type Project,
	type ProjectId,
	type Result,
} from '../../domain/index.js';
import type { Clock, ProjectRepository } from '../ports/index.js';

export type UpdateProjectDeps = {
	readonly projects: ProjectRepository;
	readonly clock: Clock;
};

export type UpdateProjectInput = {
	readonly name?: string;
	readonly description?: string;
	readonly metadata?: Project['metadata'];
};

/** Porte `PUT /project/:id` (hors gestion des lyrics, déléguée à saveLyrics). */
export async function updateProject(
	deps: UpdateProjectDeps,
	id: ProjectId,
	input: UpdateProjectInput
): Promise<Result<Project, ValidationError | NotFoundError>> {
	const existing = await deps.projects.findById(id);
	if (!existing) return err(new NotFoundError('Project', id));

	if (input.name !== undefined) {
		try {
			assertValidProjectName(input.name);
		} catch (e) {
			if (e instanceof ValidationError) return err(e);
			throw e;
		}
	}

	const updated: Project = {
		...existing,
		...(input.name !== undefined ? { name: input.name.trim() } : {}),
		...(input.description !== undefined
			? { description: input.description }
			: {}),
		...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
		updatedAt: deps.clock.now(),
	};
	await deps.projects.save(updated);
	return ok(updated);
}
