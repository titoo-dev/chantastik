import { NotFoundError, err, ok, type Project, type ProjectId, type Result } from '../../domain/index.js';
import type { ProjectRepository } from '../ports/index.js';

export type GetProjectDeps = { readonly projects: ProjectRepository };

export async function getProject(
	deps: GetProjectDeps,
	id: ProjectId
): Promise<Result<Project, NotFoundError>> {
	const project = await deps.projects.findById(id);
	if (!project) return err(new NotFoundError('Project', id));
	return ok(project);
}
