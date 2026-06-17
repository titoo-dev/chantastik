import type {
	IsoTimestamp,
	ProjectId,
	RenderId,
} from '../shared/identifiers.js';
import type { AspectRatio, ThemeId } from '../theme/theme.js';

export type RenderStatus =
	| 'pending'
	| 'rendering'
	| 'completed'
	| 'failed';

/**
 * Job de rendu vidéo. Le domaine modélise le cycle de vie ; l'exécution réelle
 * (Remotion Lambda ou service Express) est un adapter du port `VideoRenderer`.
 */
export type VideoRender = {
	readonly id: RenderId;
	readonly projectId: ProjectId;
	readonly theme: ThemeId;
	readonly aspectRatio: AspectRatio;
	readonly status: RenderStatus;
	/** Progression [0,1]. */
	readonly progress: number;
	readonly outputUrl?: string;
	readonly error?: string;
	readonly createdAt: IsoTimestamp;
	readonly updatedAt: IsoTimestamp;
};

export const isTerminal = (status: RenderStatus): boolean =>
	status === 'completed' || status === 'failed';
