/**
 * Identifiants typés (branded types) pour empêcher de confondre un
 * `ProjectId` avec un `AudioId` à la compilation, tout en restant des
 * chaînes au runtime.
 */
declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

export type ProjectId = Brand<string, 'ProjectId'>;
export type AudioId = Brand<string, 'AudioId'>;
export type LyricsId = Brand<string, 'LyricsId'>;
export type CoverId = Brand<string, 'CoverId'>;
export type RenderId = Brand<string, 'RenderId'>;

export const ProjectId = (raw: string): ProjectId => raw as ProjectId;
export const AudioId = (raw: string): AudioId => raw as AudioId;
export const LyricsId = (raw: string): LyricsId => raw as LyricsId;
export const CoverId = (raw: string): CoverId => raw as CoverId;
export const RenderId = (raw: string): RenderId => raw as RenderId;

/** Timestamp ISO-8601 ; le domaine ne lit jamais l'horloge directement (port `Clock`). */
export type IsoTimestamp = Brand<string, 'IsoTimestamp'>;
export const IsoTimestamp = (raw: string): IsoTimestamp => raw as IsoTimestamp;
