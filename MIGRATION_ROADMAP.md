# Roadmap de migration — Chantastik → Next.js + Architecture Hexagonale

> **Objectif** : migrer le monorepo Chantastik vers **Next.js (App Router)** déployé sur **Cloudflare via OpenNext**, en profitant de l'opération pour **moderniser les packages et les pratiques**, et en **structurant le code autour d'une architecture hexagonale (ports & adapters)** afin de monter en expertise sur ce paradigme.
>
> **Décisions actées (2026-06-17)**
> - **Hébergement** : Cloudflare via `@opennextjs/cloudflare`. On **conserve** les KV (`PROJECT_KV`, `AUDIO_KV`, `LYRICS_KV`, `YOUTUBE_KV`) et R2 (`AUDIO_FILES`, `COVER_FILES`) existants → **zéro migration de données**.
> - **Rendu vidéo Remotion** : **decision gate en Phase 6** (Remotion Lambda vs service `apps/renderer` modernisé). Le domaine est conçu pour rendre ce choix interchangeable.
> - **Périmètre immédiat** : ce roadmap **+ scaffold initial** du package `@repo/core` hexagonal et de la structure de l'app Next.

---

## 1. État des lieux (audit de l'existant)

### 1.1 Cartographie du monorepo

| App / Package | Stack actuelle | Rôle | Devenir |
|---|---|---|---|
| `apps/client` | React 19, **Vite 6**, **TanStack Router** (file-based), TanStack Query, Zustand (3 stores), Radix/shadcn, Tailwind v4, **Remotion 4** (player + thèmes), react-player/youtube, Zod 3 | SPA d'édition de lyrics & preview vidéo | → **`apps/web`** (Next.js App Router) |
| `apps/server` | **Hono** sur Cloudflare Workers, KV + R2, `music-metadata`, `crypto-js`, `uuid` | API REST (project / audio / youtube) | → **absorbé** par les Route Handlers / Server Actions Next + adapters Cloudflare |
| `apps/renderer` | **Express 5** + `@remotion/bundler` + `@remotion/renderer`, SSE | Rendu vidéo serveur (headless Chromium) | → **decision gate Phase 6** (conservé/modernisé OU remplacé par Remotion Lambda) |
| `packages/eslint-config` | ESLint 9 flat config (contient déjà un preset `next-js` !) | Config lint partagée | → étendu (boundaries hexagonales) |
| `packages/typescript-config` | tsconfig partagés | Config TS partagée | → étendu (configs `core`/`node`/`next`) |

### 1.2 Domaine métier identifié (cœur de l'hexagone)

Le code actuel révèle un domaine clair, aujourd'hui éparpillé entre `apps/server/src/types.ts`, `apps/client/src/data/*` et les routes :

- **Project** — agrégat racine : `id`, `name`, `description`, timestamps, `audioId`, `lyricsId`, `assetIds`, `metadata` (tags, category, public…).
- **Audio / Track** — `id`, `filename`, `contentType`, `size`, `fileHash`, `metadata` (title, artist, album, year, genre, duration), `coverArt`.
- **Lyrics** — `id`, `text`, `lines: LyricLine[]`, `projectId`, `metadata` (language, source `manual|imported|generated`, confidence, version).
- **LyricLine** — `id`, `text`, `timestamp?`, `style?` (emphasis, volume, duration).
- **Theme / VideoComposition** — thèmes Remotion (`minimal-zen`, `retro-reel`, `vibrant-memories`, `embedded-lyrics`…), `AspectRatioType` (`horizontal|vertical`).
- **VideoRender** — job de rendu (statut, progression, sortie).

> ⚠️ **Dette identifiée** : les types sont **dupliqués** client/serveur et divergent (`LyricLine` côté client n'a pas `style`, `Metadata.title` requis côté client mais optionnel côté serveur). La migration hexagonale **unifie** ces types dans `@repo/core` comme source de vérité unique.

### 1.3 Points d'attention techniques

- **Remotion** ne tourne **pas** sur l'edge/Workers (Chromium headless). Doit rester un adapter externe (Lambda ou service Node) — d'où la decision gate.
- **TanStack Router → App Router** : remplacement du routage file-based, du `routeTree.gen.ts`, et du contexte router (queryClient injecté).
- **Stores Zustand** : restent **client-only** ; à wrapper dans des Client Components (`'use client'`).
- **`import.meta.env.VITE_*`** → `process.env` / `NEXT_PUBLIC_*`.
- **CORS** (actuel `origin: '*'`) disparaît : front et API dans le même déploiement Next.

---

## 2. Architecture cible (hexagonale / ports & adapters)

### 2.1 Principe directeur

> Le **domaine** ne connaît **ni Next.js, ni Cloudflare, ni Remotion, ni KV/R2**. Il expose des **ports** (interfaces). Le monde extérieur s'y branche via des **adapters**. La dépendance pointe **toujours vers le centre**.

```
                        ┌─────────────────────────────────────────────┐
   ADAPTERS PRIMAIRES   │                  DOMAINE                     │   ADAPTERS SECONDAIRES
   (driving / inbound)  │             (cœur, pur, testable)           │   (driven / outbound)
                        │                                             │
  Next Route Handlers ──▶  Ports inbound (use cases / application)    │
  Server Actions      ──▶    • CreateProject  • UploadAudio           │
  React Server Comp.  ──▶    • SaveLyrics      • SyncLyrics           │
  CLI / cron / tests  ──▶    • ImportYoutube   • RenderVideo          │
                        │    • ListProjects    • DeleteProject         │
                        │                                             │
                        │  Entités & Value Objects                    │
                        │    Project · Audio · Lyrics · Theme · Render │
                        │                                             │
                        │  Ports outbound (interfaces)         ◀────── R2AudioStorage (R2)
                        │    • ProjectRepository               ◀────── KvProjectRepository (KV)
                        │    • LyricsRepository                ◀────── KvLyricsRepository (KV)
                        │    • AudioStorage / CoverStorage     ◀────── R2CoverStorage (R2)
                        │    • MetadataExtractor               ◀────── MusicMetadataExtractor
                        │    • YoutubeGateway                  ◀────── YoutubeApiGateway
                        │    • VideoRenderer                   ◀────── RemotionLambdaRenderer
                        │    • Clock / IdGenerator / Hasher    ◀────── (uuid / crypto-js)
                        └─────────────────────────────────────────────┘
```

### 2.2 Découpage en packages (workspaces)

```
packages/
  core/                      # @repo/core — DOMAINE PUR (zéro dépendance runtime)
    src/
      domain/                # entités, value objects, erreurs métier, invariants
        project/
        audio/
        lyrics/
        theme/
        render/
        shared/              # VO transverses (Id, Timestamp, FileHash, Result…)
      application/           # use cases (ports inbound) — orchestration
        ports/               # ports OUTBOUND (interfaces des repositories/gateways)
        use-cases/           # 1 fichier = 1 use case
      index.ts
  infra-cloudflare/          # @repo/infra-cloudflare — adapters KV/R2 (impl. des ports outbound)
  infra-remotion/            # @repo/infra-remotion — adapter VideoRenderer
  infra-youtube/             # @repo/infra-youtube — adapter YoutubeGateway
  ui/                        # @repo/ui — design system (shadcn/Radix extraits du client)
  eslint-config/             # étendu : règles de boundaries (import/no-restricted-paths)
  typescript-config/         # base · core · node · next

apps/
  web/                       # @repo/web — Next.js (App Router) + adapters primaires
  renderer/                  # (conditionnel — voir Phase 6)
```

**Règles de dépendances (imposées par ESLint `no-restricted-paths`)**
- `core/domain` → **rien** (pas même `application`).
- `core/application` → `core/domain` uniquement.
- `infra-*` → `core` (implémentent les ports), jamais l'inverse.
- `apps/web` → `core` + `infra-*` + `ui`. Le **câblage** (injection de dépendances) se fait dans une **composition root** (`apps/web/src/composition-root.ts`).
- `core` ne dépend **jamais** d'un `infra-*` ni d'`apps/*`.

### 2.3 Pattern de composition (DI sans framework)

Pas de conteneur IoC lourd : on assemble les use cases avec leurs adapters dans une **composition root** par environnement (Cloudflare runtime, tests, scripts). Les use cases sont des fonctions/classes recevant leurs ports par paramètre → **100 % testables** avec des fakes en mémoire.

---

## 3. Modernisation des packages (montées de version)

| Domaine | Actuel | Cible | Notes |
|---|---|---|---|
| Framework | Vite 6 + TanStack Router | **Next.js 15+ (App Router, RSC)** | Turbopack en dev |
| React | 19.0 | **19.x (dernière)** | déjà sur React 19 ✅ |
| Runtime déploiement | Workers (Hono) | **OpenNext + Workers** (`@opennextjs/cloudflare`) | conserve KV/R2 |
| TypeScript | 5.7.2 | **5.x dernière stable** | `moduleResolution: bundler`, `verbatimModuleSyntax` |
| Tailwind | v4.0 | **v4 dernière** | passer du plugin Vite au plugin PostCSS/Next |
| TanStack Query | 5.66 | **5.x dernière** | hybridé avec RSC (fetch côté serveur prioritaire) |
| Zustand | 5.0 | **5.x dernière** | client-only, `'use client'` |
| Zod | 3.25 | **Zod 4** (ou dernière 3.x) | valider à la frontière des adapters + schémas Remotion |
| ESLint | 9 flat | **9 dernière** + règles boundaries | `eslint-plugin-boundaries` ou `no-restricted-paths` |
| Turbo | 2.5 | **2.x dernière** | tasks `build/lint/test/check-types` |
| pnpm | 10.12 | **10.x dernière** | `catalog:` pour centraliser les versions |
| Remotion | 4.0.305 | **4.x dernière** | aligner player + lambda/renderer |
| Hono | 4.7 | **supprimé** | remplacé par Route Handlers Next |
| Express (renderer) | 5.1 | decision gate P6 | conservé/modernisé ou supprimé |
| Tests | Vitest 3 | **Vitest dernière + Playwright** | unit (domaine) + e2e (parcours) |

**Pratiques transverses à adopter**
- **pnpm catalog** (`pnpm-workspace.yaml`) pour aligner React/TS/Zod sur tout le repo.
- **Zod comme garde-frontière** : tout ce qui entre dans le domaine (HTTP body, réponses YouTube, métadonnées audio) est validé → le domaine ne reçoit que des données déjà sûres.
- **`Result`/erreurs typées** dans le domaine plutôt que des exceptions opaques.
- **Server Components par défaut**, `'use client'` uniquement aux feuilles interactives (player, éditeur, stores Zustand).
- **Doppler** (déjà présent) pour les secrets ; `NEXT_PUBLIC_*` pour le public.

---

## 4. Phases d'exécution

> Chaque phase est livrable et **n'introduit pas de régression** : l'ancien et le nouveau coexistent jusqu'au cutover (strangler fig pattern).

### Phase 0 — Fondations & garde-fous ✅ *(faite — branche `feat/next-hexagonal`)*
- [x] Geler une branche de migration (`feat/next-hexagonal`), tagger l'état Vite actuel (`pre-nextjs-migration`).
- [x] Mettre en place `pnpm catalog:` (dans `pnpm-workspace.yaml`) et aligner les versions transverses (typescript, react/react-dom, @types/*, zod, vitest) sur tous les `package.json`.
- [x] Étendre `@repo/typescript-config` : `base`, `core` (strict max, pas de DOM), `node`, `nextjs`, `react-library`.
- [x] Étendre `@repo/eslint-config` avec les règles de **boundaries** hexagonales (`./hexagonal`) — garde infra + garde domaine→application (string-based, fiable sans résolveur). Bloquant en CI via `--max-warnings 0`.
- [x] Turbo : task `test` ajoutée ; CI GitHub Actions (`.github/workflows/ci.yml`) = install → `check-types` → `lint` → `test`.

> ✅ Vérifié : `pnpm check-types`, `pnpm lint`, `pnpm test` verts (core 3 tests, client 100 tests). La garde domaine→application a été testée par sonde (déclenche bien) puis retirée.
>
> ℹ️ Note d'état : seuls `@repo/core` (lint + check-types + test) et `@repo/client` (test) ont des tasks. Ajouter `lint`/`check-types` à `client`/`server`/`renderer` se fera au fil de leur portage (Phases 3–5).

### Phase 1 — Extraction du domaine `@repo/core` 🟡 *(largement faite)*
- [x] Créer `packages/core` (domaine pur, zéro dépendance runtime).
- [x] Définir entités & VO : `Project`, `Audio`, `Lyrics`, `LyricLine`, `Theme`, `VideoRender` + VO partagés (ids brandés, `IsoTimestamp`, `Result`/erreurs).
- [x] **Unifier** les types divergents client/serveur → source de vérité unique.
- [x] Rapatrier la logique PURE noyée dans `apps/server/src/utils.ts` : validation de requête YouTube, `extractVideoId`, parsing durée ISO-8601, scoring de titre, heuristique `draftLyricsFromTitle`, parsing/sérialisation LRC.
- [x] Schémas Zod de validation à la frontière (`application/schemas.ts`).
- [x] Tests unitaires du domaine (LRC, youtube, heuristiques) — **sans aucune infra**.
- [ ] Reste : VO `FileHash`/`AspectRatio` typés plus stricts, invariants supplémentaires au besoin.

### Phase 2 — Couche application (use cases) & ports outbound 🟡 *(largement faite)*
- [x] Définir les **ports outbound** : `ProjectRepository`, `LyricsRepository`, `AudioRepository` (+ `findByHash`), `BlobStorage`, `MetadataExtractor`, `YoutubeGateway`, `VideoRenderer`, `Clock`, `IdGenerator`, `Hasher`.
- [x] Implémenter les **use cases** (1/fichier) en migrant la logique Hono : `createProject`, `listProjects`, `getProject`, `updateProject`, `deleteProject` (cascade audio+cover), `saveLyrics`, `getLyrics`, `uploadAudio` (dédup hash → extraction → R2 → création projet auto).
- [x] **Fakes in-memory** de chaque port (`testing/`) → suite de tests application déterministe (16 tests verts).
- [ ] Reste : use cases `importYoutubeLyrics`, `searchYoutube`, `requestVideoRender` (dépendent des adapters infra Phase 3 / decision gate Phase 6).

### Phase 3 — Adapters secondaires (infra)
- [ ] `@repo/infra-cloudflare` : `KvProjectRepository`, `KvLyricsRepository`, `KvAudioRepository`, `R2AudioStorage`, `R2CoverStorage` (reprend exactement les clés `project:*`, `audio:*`, `lyrics:*` → **compatibilité données**).
- [ ] `@repo/infra-youtube` : `YoutubeApiGateway` (reprend `YOUTUBE_API_KEY` + cache `YOUTUBE_KV`).
- [ ] `MusicMetadataExtractor` (`music-metadata`), `UuidGenerator`, `CryptoJsHasher`, `SystemClock`.
- [ ] Tests de contrat : chaque adapter passe la **même** suite de tests que son fake (ports respectés).

### Phase 4 — App Next.js (`apps/web`) + adapters primaires
- [ ] Scaffold Next.js App Router + Tailwind v4 + intégration `@opennextjs/cloudflare` (bindings KV/R2 via `getCloudflareContext`).
- [ ] **Composition root** : câbler use cases ↔ adapters Cloudflare.
- [ ] Recréer l'API en **Route Handlers** (`app/api/project/...`, `/audio`, `/youtube`) et/ou **Server Actions** → suppression de `apps/server` (Hono) en fin de phase.
- [ ] Layout racine = portage de `__root.tsx` (providers : Theme, ColorFlow, Audio refs, Query) en RSC + Client Components ciblés.

### Phase 5 — Migration de l'UI
- [ ] Extraire le design system vers `@repo/ui` (composants Radix/shadcn, `ui/*`).
- [ ] Porter les routes TanStack (`/`) en pages App Router (`app/page.tsx`).
- [ ] Marquer en `'use client'` : stores Zustand, éditeur de lyrics, player, hooks audio/hotkeys, color-flow.
- [ ] Hybrider TanStack Query ↔ RSC : data initiale rendue serveur, interactions clientes via Query.
- [ ] Remplacer `import.meta.env.VITE_*` → `NEXT_PUBLIC_*` / `process.env`.
- [ ] Porter Remotion **Player** (client) ; les compositions/thèmes restent dans `@repo/core`-adjacent ou un package `remotion`.

### Phase 6 — 🚩 Decision gate : rendu vidéo
Choisir et implémenter l'adapter `VideoRenderer` :

| Option | Pour | Contre | Quand choisir |
|---|---|---|---|
| **Remotion Lambda** (`@remotion/lambda`, déjà en deps) | Scalable, à la demande, rien à maintenir, découplé | Couplage AWS, coûts par rendu, IAM à gérer | Pics de charge, pas d'ops dédiés |
| **Service `apps/renderer`** modernisé (Express+Remotion, SSE) | Déjà fonctionnel (progression SSE), contrôle total | Conteneur long-running à héberger (hors Workers), scaling manuel | Volume prévisible, besoin de SSE fin |

- [ ] Implémenter l'adapter retenu derrière le port `VideoRenderer` (le reste du code **ne change pas**).
- [ ] Brancher la progression (webhook/poll pour Lambda, SSE pour service).

### Phase 7 — Déploiement & observabilité
- [ ] Build OpenNext → déploiement Workers (`wrangler`/`opennextjs-cloudflare deploy`), bindings KV/R2 mappés.
- [ ] Conserver `observability.enabled` (déjà actif dans wrangler).
- [ ] Variables/secrets via Doppler.
- [ ] Smoke tests post-déploiement (upload audio → save lyrics → preview → render).

### Phase 8 — Tests, qualité & docs
- [ ] Couverture domaine + application (Vitest) ; e2e parcours clés (Playwright).
- [ ] Mettre à jour `README.md` (actuellement le template Turborepo générique) avec l'archi réelle.
- [ ] ADRs (Architecture Decision Records) : OpenNext, hexagonal, rendu vidéo.

### Phase 9 — Cutover & nettoyage
- [ ] Bascule du domaine de prod sur le déploiement Next/OpenNext.
- [ ] Supprimer `apps/client` (Vite) et `apps/server` (Hono) une fois la parité validée.
- [ ] Retirer dépendances mortes (Hono, `@tanstack/react-router*`, `vite*`).

---

## 5. Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Remotion incompatible edge | Bloquant rendu | Adapter externe (Phase 6), jamais dans le runtime Workers |
| OpenNext : limites Workers (CPU/temps, taille) | Moyen | Garder les tâches lourdes hors requête ; valider tôt sur un POC OpenNext |
| Divergence des types client/serveur | Bugs subtils | Unification dans `@repo/core` (Phase 1) avant tout portage |
| Régression pendant migration | Élevé | Strangler fig : ancien + nouveau coexistent, cutover unique en P9 |
| Fuite d'infra dans le domaine | Dette | Boundaries ESLint + revues ; `core` sans dépendance runtime |
| Compat données KV/R2 | Élevé | Adapters reprennent les **clés et schémas existants** à l'identique (Phase 3) |

---

## 6. Scaffold livré avec ce roadmap

Le package `@repo/core` (domaine + application + ports) et la structure de dossiers sont initialisés dès maintenant — voir `packages/core/`. C'est le **point d'entrée** des Phases 1–2 : on y déplace progressivement la logique, sans toucher à l'app existante.

---

## 7. Checklist de démarrage (ordre recommandé)

1. Valider ce roadmap.
2. Phase 0 (catalog pnpm + configs TS/ESLint boundaries).
3. Étoffer `@repo/core` (scaffold fourni) → domaine + use cases + fakes + tests.
4. `@repo/infra-cloudflare` (adapters KV/R2 compatibles données).
5. POC `apps/web` OpenNext (1 use case bout-en-bout : `listProjects`).
6. Itérer route par route (strangler), puis UI, puis decision gate rendu, puis cutover.
