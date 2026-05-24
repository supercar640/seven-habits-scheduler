# @seven-habits/backend

Convex backend: schema, auth config, and per-feature query/mutation slices.

## First-time setup (required once)

`convex/_generated/` is **not committed** — it is produced by the Convex CLI.
Run this once with your Convex account:

```bash
pnpm --filter @seven-habits/backend dev   # runs `convex dev`
```

This will:

- log you into Convex and create/link a deployment,
- generate `convex/_generated/` (the typed API),
- print `NEXT_PUBLIC_CONVEX_URL` / `EXPO_PUBLIC_CONVEX_URL` to put in the apps' `.env`.

Until this runs, `pnpm --filter @seven-habits/backend typecheck` skips (no generated types yet).

Also set `CLERK_JWT_ISSUER_DOMAIN` in the Convex dashboard env (see `.env.example`)
so `convex/auth.config.ts` can validate Clerk JWTs.

## Layout

```
convex/
  schema.ts          # all tables + indexes
  auth.config.ts     # Clerk JWT provider
  users/             # profile + auth helpers (requireIdentity, getCurrentUserOrThrow)
  tasks/             # quadrant derived from @seven-habits/core getQuadrant
  roles/ goals/ planner/ reviews/
```

Every per-user query/mutation resolves the user via `getCurrentUserOrThrow` so data
stays isolated by Clerk identity.
