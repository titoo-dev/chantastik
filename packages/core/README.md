# @repo/core

Domaine métier **pur** de Chantastik, structuré en **architecture hexagonale**.
Voir le plan d'ensemble : [`../../MIGRATION_ROADMAP.md`](../../MIGRATION_ROADMAP.md).

## Règle d'or

> Ce package ne dépend **jamais** de Next.js, Cloudflare, Remotion ou d'un quelconque `infra-*`.
> La dépendance pointe toujours vers le centre. Les `infra-*` implémentent les ports ; ils ne sont jamais importés ici.

## Structure

```
src/
  domain/            # entités, value objects, invariants, logique pure
    shared/          # Result, identifiants brandés, erreurs métier
    project/ audio/ lyrics/ theme/ render/
  application/
    ports/           # ports OUTBOUND (interfaces : repositories, gateways, Clock…)
    use-cases/       # ports INBOUND (1 use case = 1 fichier)
  testing/           # fakes in-memory des ports → tests sans infra
```

## Exemple : câblage (composition root, côté `apps/web`)

```ts
import { createProject } from '@repo/core/application';
// adapters réels fournis par @repo/infra-cloudflare + composition root
const deps = { projects, clock, ids };
const result = await createProject(deps, { name: 'Mon morceau' });
if (result.ok) {/* result.value: Project */}
```

## Tests

```sh
pnpm --filter @repo/core test
```

Les use cases sont exercés avec les fakes in-memory (`./testing`) : rapides,
déterministes, zéro I/O. Les adapters réels devront passer la **même** suite
(tests de contrat) — Phase 3 du roadmap.

## Prochaines étapes (Phases 1–3)

1. Compléter les entités/VO et les invariants manquants.
2. Migrer le reste de la logique des routes Hono en use cases.
3. Implémenter `@repo/infra-cloudflare` (KV/R2) derrière les ports outbound.
