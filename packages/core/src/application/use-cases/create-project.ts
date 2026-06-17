import {
	assertValidProjectName,
	ProjectId,
	ok,
	err,
	ValidationError,
	type Project,
	type Result,
} from '../../domain/index.js';
import type { Clock, IdGenerator, ProjectRepository } from '../ports/index.js';

export type CreateProjectDeps = {
	readonly projects: ProjectRepository;
	readonly clock: Clock;
	readonly ids: IdGenerator;
};

export type CreateProjectInput = {
	readonly name: string;
	readonly description?: string;
};

/**
 * Use case `createProject`. Reçoit ses dépendances (ports) par paramètre :
 * 100 % testable avec des fakes, aucune connaissance de KV/HTTP.
 */
export async function createProject(
	deps: CreateProjectDeps,
	input: CreateProjectInput
): Promise<Result<Project, ValidationError>> {
	try {
		assertValidProjectName(input.name);
	} catch (e) {
		if (e instanceof ValidationError) return err(e);
		throw e;
	}

	const now = deps.clock.now();
	const project: Project = {
		id: ProjectId(deps.ids.generate()),
		name: input.name.trim(),
		...(input.description !== undefined
			? { description: input.description }
			: {}),
		createdAt: now,
		updatedAt: now,
	};

	await deps.projects.save(project);
	return ok(project);
}
