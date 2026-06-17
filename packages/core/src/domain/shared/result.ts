/**
 * `Result` — modélisation explicite du succès/échec sans exceptions.
 *
 * Le domaine n'émet jamais d'exception opaque : les cas d'échec métier
 * (validation, invariant rompu, introuvable) sont des valeurs typées.
 * Les adapters traduisent ensuite ces `Result` en réponses HTTP, etc.
 */
export type Result<T, E = DomainError> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(
	r: Result<T, E>
): r is { ok: true; value: T } => r.ok;

export const isErr = <T, E>(
	r: Result<T, E>
): r is { ok: false; error: E } => !r.ok;

/** Erreur métier de base. Étendue par chaque sous-domaine. */
export class DomainError extends Error {
	constructor(
		public readonly code: string,
		message: string
	) {
		super(message);
		this.name = 'DomainError';
	}
}

export class ValidationError extends DomainError {
	constructor(message: string) {
		super('VALIDATION', message);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends DomainError {
	constructor(entity: string, id: string) {
		super('NOT_FOUND', `${entity} introuvable: ${id}`);
		this.name = 'NotFoundError';
	}
}
