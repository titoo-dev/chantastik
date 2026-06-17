import type { Project } from '../../domain/index.js';
import type { ProjectRepository } from '../ports/index.js';

export type ListProjectsDeps = {
	readonly projects: ProjectRepository;
};

/**
 * Use case `listProjects` — candidat idéal pour le POC OpenNext bout-en-bout
 * (Phase 4, §7 du roadmap) : aucun effet de bord, juste lecture.
 */
export async function listProjects(
	deps: ListProjectsDeps
): Promise<Project[]> {
	const all = await deps.projects.findAll();
	return [...all].sort((a, b) =>
		b.updatedAt.localeCompare(a.updatedAt)
	);
}
