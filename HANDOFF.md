# HANDOFF — Migration Chantastik → Next.js + Hexagonal

> Document de passation pour les prochaines sessions. Lis-le **avant** de coder.
> Plan détaillé : [`MIGRATION_ROADMAP.md`](./MIGRATION_ROADMAP.md). Domaine : [`packages/core/README.md`](./packages/core/README.md).
>
> **Dernière mise à jour** : 2026-06-17 — fin des Phases 0 à 2 (largement).

---

## 1. TL;DR — où on en est

On migre Chantastik (créateur de vidéos lyriques) d'une SPA Vite + serveur Hono/Cloudflare vers **Next.js (App Router) sur Cloudflare via OpenNext**, en **architecture hexagonale**.

- **Branche de travail** : `feat/next-hexagonal` (poussée, PR dispo sur GitHub). Tag de l'état pré-migration : `pre-nextjs-migration`.
- **Fait** : Phase 0 (fondations/garde-fous) + Phases 1–2 (domaine `@repo/core` + use cases applicatifs, 16 tests verts).
- **Pas encore touché** : `apps/client` (Vite), `apps/server` (Hono), `apps/renderer` (Express) — ils tournent toujours, rien n'est cassé. Le nouveau code vit dans `packages/core`.
- **Prochaine étape** : **Phase 3 — `@repo/infra-cloudflare`** (adapters KV/R2 derrière les ports), puis POC `apps/web` OpenNext.

---

## 2. Décisions actées (ne pas re-litiger sans raison)

| Sujet | Décision | Conséquence |
|---|---|---|
| Hébergement | **Cloudflare via `@opennextjs/cloudflare`** | On CONSERVE les KV/R2 existants → **zéro migration de données** |
| Rendu vidéo Remotion | **Decision gate Phase 6** (Lambda vs service Express) | Non tranché. Le port `VideoRenderer` rend le choix interchangeable |
| Architecture | **Hexagonale** (ports & adapters) | Objectif explicite : montée en expertise. Le domaine ne connaît aucune techno |
| `exactOptionalPropertyTypes` | **Désactivé** dans `core.json` | Créait trop de friction sur le mapping de DTO à champs optionnels |

---

## 3. Carte du dépôt (état actuel)

```
packages/
  core/                    @repo/core — DOMAINE PUR (fait, 16 tests verts)
    src/
      domain/              entités, VO, logique pure (project/audio/lyrics/theme/render/youtube/shared)
      application/
        ports/index.ts     ports OUTBOUND (interfaces) ← les infra-* implémentent ça
        schemas.ts         schémas Zod de frontière (anti-corruption)
        use-cases/         ports INBOUND (1 use case = 1 fichier)
      testing/fakes.ts     fakes in-memory de TOUS les ports
  eslint-config/           + ./hexagonal (garde-fous boundaries) + ./next-js (déjà prêt)
  typescript-config/       base · core · node · nextjs · react-library

apps/
  client/                  SPA Vite (INCHANGÉE — à porter Phases 4-5)
  server/                  Hono/Cloudflare (INCHANGÉE — logique en cours de migration vers core)
  renderer/                Express+Remotion (INCHANGÉE — decision gate Phase 6)
```

### Ports déjà définis (`packages/core/src/application/ports/index.ts`)
`ProjectRepository`, `LyricsRepository`, `AudioRepository` (+`findByHash`/`delete`), `BlobStorage`, `MetadataExtractor`, `YoutubeGateway`, `VideoRenderer`, `Clock`, `IdGenerator`, `Hasher`.

### Use cases déjà écrits
`createProject`, `listProjects`, `getProject`, `updateProject`, `deleteProject` (cascade audio+cover), `saveLyrics`, `getLyrics`, `uploadAudio` (dédup hash → extraction → R2 → projet auto).

---

## 4. Règles d'architecture (IMPOSÉES par ESLint — ne pas contourner)

Le domaine pointe toujours vers le centre. Garde-fous dans `@repo/eslint-config/hexagonal`, bloquants en CI via `--max-warnings 0` :

- `domain/**` n'importe **que** `domain` — ni `application`, ni `testing`, ni infra.
- `application/**` n'importe **pas** d'infra (`next`, `@cloudflare/*`, `@opennextjs/*`, `@remotion/*`, `react`, `hono`, `express`).
- Les `infra-*` implémentent les ports ; ils ne sont **jamais** importés par `core`.
- Le câblage (DI) se fait dans une **composition root** côté `apps/web` (à créer).

⚠️ Le `boundaries/element-types` du plugin est neutralisé (specifiers `.js`→`.ts` non résolus sans resolver TS) : la garde réelle est en **`no-restricted-imports`** string-based. Si tu ajoutes un resolver TS plus tard, tu peux réactiver `boundaries`.

---

## 5. Conventions de code (observées dans le repo)

- **TypeScript ESM**, imports avec extension `.js` (NodeNext) même pour les `.ts` — ex. `import { x } from './foo.js'`.
- **Indentation par tabulations** dans `packages/core` (le reste du repo aussi).
- Erreurs métier = **valeurs `Result<T,E>`** (pas d'exceptions). Voir `domain/shared/result.ts` (`ok`/`err`/`isOk`/`isErr`, `ValidationError`, `NotFoundError`).
- **Ids brandés** (`ProjectId`, `AudioId`…) : construits via la fonction homonyme `ProjectId('...')`.
- Use case = fonction `(deps, input) => Promise<Result>`, deps = objet de ports. Testé avec les fakes de `testing/`.
- Français pour les commentaires/docs métier (cohérent avec le code existant et l'utilisateur).

---

## 6. Commandes utiles

```sh
pnpm install                       # installe (catalog résout les versions transverses)
pnpm --filter @repo/core test      # 16 tests du domaine/application
pnpm --filter @repo/core lint      # garde-fous hexagonaux (--max-warnings 0)
pnpm --filter @repo/core check-types
pnpm test / pnpm lint / pnpm check-types   # via Turbo, tout le monorepo
```

CI : `.github/workflows/ci.yml` (install → check-types → lint → test) sur push `main`/`feat/**` et PR.

---

## 7. Prochaines étapes (ordre recommandé)

### Phase 3 — `@repo/infra-cloudflare` (adapter secondaire) ⬅️ **À FAIRE EN PREMIER**
Implémenter les ports outbound avec KV/R2. **Reprendre les clés existantes à l'identique** (compatibilité données prod) :
- `KvProjectRepository` → clés `project:{id}` (KV `PROJECT_KV`).
- `KvLyricsRepository` → clés `lyrics:{id}` (KV `LYRICS_KV`).
- `KvAudioRepository` → clés `audio:{id}` (KV `AUDIO_KV`) ; `findByHash` = scan `list({prefix:'audio:'})` (comme `findFileByHash` actuel).
- `R2BlobStorage` → buckets `AUDIO_FILES` (`{id}.mp3`) et `COVER_FILES` (`{coverId}.{ext}`).
- `MusicMetadataExtractor` (`music-metadata`), `CryptoJsHasher` (SHA-256, `crypto-js`), `UuidGenerator` (`uuid`), `SystemClock`.
- **Tests de contrat** : faire passer aux adapters la même suite que les fakes (Miniflare/workers pool ou mocks KV/R2).
- Source de vérité du comportement actuel : `apps/server/src/{routes,utils,types}.ts`.

### Phase 4 — `apps/web` (Next.js + OpenNext)
- Scaffold App Router + Tailwind v4 + `@opennextjs/cloudflare` (bindings via `getCloudflareContext`).
- **Composition root** (`apps/web/src/composition-root.ts`) : câble use cases ↔ adapters Cloudflare.
- **POC bout-en-bout** : route `GET /api/project/all` → `listProjects(deps)` (use case sans effet de bord, idéal pour valider la chaîne).
- Recréer l'API en Route Handlers / Server Actions, puis retirer `apps/server`.

### Restes Phase 1-2 (quand le besoin se présente)
Use cases `searchYoutube`, `importYoutubeLyrics`, `requestVideoRender` (dépendent des adapters infra / decision gate Phase 6).

### Plus tard
Phase 5 (UI : `@repo/ui`, portage routes TanStack→App Router, stores Zustand en `'use client'`), Phase 6 (decision gate rendu vidéo), Phase 7 (déploiement OpenNext), Phase 8 (tests e2e Playwright), Phase 9 (cutover + suppression Vite/Hono).

---

## 8. Pièges connus / à surveiller

- **Remotion ne tourne pas sur Workers/edge** (Chromium headless). Toujours derrière le port `VideoRenderer`, jamais dans le runtime Next.
- **Types dupliqués** : `apps/client/src/data/types.ts` et `apps/server/src/types.ts` divergent encore de `@repo/core`. La source de vérité est désormais `@repo/core` ; lors du portage, supprimer les doublons.
- **`eslint-plugin-only-warn`** (preset `base`) downgrade tout en warning → utiliser `--max-warnings 0` pour rendre une règle bloquante.
- **OpenNext + Workers** ont des limites CPU/temps/taille : valider tôt sur le POC, garder le lourd hors requête.
- `apps/renderer` a un `postinstall: tsc` — il rebuild à chaque `pnpm install`.

---

## 9. Mémoire de session

Une mémoire projet existe : `memory/nextjs-hexagonal-migration.md` (décisions + état). La mettre à jour à chaque phase franchie.
