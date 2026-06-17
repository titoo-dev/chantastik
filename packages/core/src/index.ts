/**
 * @repo/core — Domaine métier pur de Chantastik (architecture hexagonale).
 *
 * - `./domain`      : entités, value objects, invariants, logique pure.
 * - `./application` : use cases (ports inbound) + ports outbound (interfaces).
 * - `./testing`     : fakes in-memory pour tester sans infrastructure.
 *
 * AUCUNE dépendance runtime vers Next.js, Cloudflare ou Remotion ici.
 */
export * from './domain/index.js';
export * from './application/index.js';
