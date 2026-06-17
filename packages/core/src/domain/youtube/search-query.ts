import { err, ok, ValidationError, type Result } from '../shared/result.js';

/**
 * Validation/normalisation d'une requête de recherche YouTube — logique PURE
 * rapatriée de `apps/server/src/utils.ts::sanitizeSearchQuery`.
 * Le domaine décide ce qu'est une requête valide ; l'adapter applique ensuite
 * le rate-limit et l'appel réseau.
 */
const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

const BLOCKED_PATTERNS: readonly RegExp[] = [
	/(?:api[_-]?key|token|secret)/i,
	/(?:script|javascript|<|>)/i,
	/(?:sql|union|select|drop|delete)/i,
	/(?:eval|function|constructor)/i,
];

export function validateSearchQuery(
	raw: unknown
): Result<string, ValidationError> {
	if (typeof raw !== 'string') {
		return err(new ValidationError('La requête est obligatoire.'));
	}
	const sanitized = raw.trim();
	if (sanitized.length < MIN_LENGTH) {
		return err(
			new ValidationError(
				`La requête doit faire au moins ${MIN_LENGTH} caractères.`
			)
		);
	}
	if (sanitized.length > MAX_LENGTH) {
		return err(
			new ValidationError(
				`La requête est trop longue (max ${MAX_LENGTH} caractères).`
			)
		);
	}
	if (BLOCKED_PATTERNS.some((pattern) => pattern.test(sanitized))) {
		return err(new ValidationError('Requête invalide.'));
	}
	return ok(sanitized);
}
