---
title: "Hostinger Deployment — OmniRoute"
version: 3.8.51
lastUpdated: 2026-09-17
---

# Hostinger Deployment — OmniRoute

Deploy OmniRoute as a **Node.js** app on [Hostinger](https://www.hostinger.com) (shared Node hosting, CloudLinux). This is a long-running process with a local SQLite file — closer to a VPS than to Vercel — as long as the panel Node version and start command are set correctly.

> Hostinger's default Node image is often **too old for Turbopack**. Native `@next/swc-linux-x64-gnu` needs **GLIBC 2.29+**. CloudLinux commonly ships 2.17, so Next.js falls back to WASM SWC and then fails with:
>
> `Turbopack is not supported on this platform … Only WebAssembly (WASM) bindings were loaded`
>
> `npm run build` now detects that glibc (or retries after that error) and uses **webpack**. You still need Node **22.22.2+** or **24.x**.

## 1. Create a Node.js app

1. In hPanel: **Websites → [domain] → Advanced → Node.js** (or **Website → Node.js**).
2. Point the app at this Git repository (or upload the project).
3. **Node.js version:** `22.22.x` / `22.x` latest, or `24.x`.  
   `v22.18.0` only prints `EBADENGINE` warnings; it is below `package.json` `engines` (`>=22.22.2 <23 || >=24.0.0 <27`). Prefer the newest 22 or 24 the panel offers.
4. **Application root:** repository root (where `package.json` lives).
5. **Build command:** `npm run build`
6. **Start command:** `npm start`
7. **Port:** leave the panel `PORT` (OmniRoute reads it). Bind address is `0.0.0.0` by default.

## 2. Environment variables

Set these in the Hostinger Node.js / domain env UI (and/or in `.env` after the first install copies `.env.example`):

| Name                      | Example / how to generate                       | Required    |
| ------------------------- | ----------------------------------------------- | ----------- |
| `JWT_SECRET`              | `openssl rand -base64 48`                       | **Yes**     |
| `API_KEY_SECRET`          | `openssl rand -hex 32`                          | **Yes**     |
| `INITIAL_PASSWORD`        | A strong password (change after first login)    | **Yes**     |
| `NEXT_PUBLIC_BASE_URL`    | `https://your-domain.com`                       | **Yes**     |
| `AUTH_COOKIE_SECURE`      | `true`                                          | Recommended |
| `REQUIRE_API_KEY`         | `true`                                          | Recommended |
| `HOST`                    | `0.0.0.0`                                       | Recommended |
| `OMNIROUTE_USE_TURBOPACK` | `0`                                             | Recommended |
| `DATA_DIR`                | `/home/USER/domains/example.com/omniroute-data` | Recommended |

`OMNIROUTE_USE_TURBOPACK=0` is belt-and-suspenders: `.env.example` copies `=1`, which would otherwise request Turbopack. The build also auto-selects webpack when glibc is older than 2.29.

Pin `JWT_SECRET` / `API_KEY_SECRET`. If they are generated on first boot and `.env` is overwritten on redeploy, dashboard sessions and encrypted keys reset.

Put `DATA_DIR` **outside** the deploy checkout so SQLite survives rebuilds.

## 3. Deploy

Push the branch Hostinger tracks, then **Deploy** / **Rebuild** in the panel.

After a successful build:

- Dashboard: `https://<your-domain>/dashboard`
- API base: `https://<your-domain>/v1`
- First login password: the `INITIAL_PASSWORD` you set

Point an IDE / CLI at it:

```
Base URL: https://<your-domain>/v1
API Key:  [create one in Dashboard → API Keys]
Model:    auto
```

## Troubleshooting

**`Turbopack is not supported on this platform` / `GLIBC_2.29' not found`** — The build must be this revision (webpack fallback in `scripts/build/build-next-isolated.mjs`). Set `OMNIROUTE_USE_TURBOPACK=0` in the panel and redeploy. Webpack uses WASM SWC and is slower; a 5–15 minute build is normal.

**`EBADENGINE` … `current: { node: 'v22.18.0'`** — Warnings only, but upgrade Node in the panel to **22.22+** or **24**.

**`'better-sqlite3' is missing from node_modules/`** — Common on shared hosts (no compiler, old glibc, or npm skipping native optional deps). OmniRoute falls through to `node:sqlite` or `sql.js`. The gateway still starts; native SQLite is faster if you can install build tools.

**Build killed / out of memory** — Shared Node plans are tight. Webpack peaks lower than Turbopack; if the panel still OOMs, use a VPS, Docker, or [Vercel](./VERCEL.md) (ephemeral SQLite preview).

**App not reachable after “build succeeded”** — Confirm start command is `npm start`, `HOST=0.0.0.0`, and the panel proxy targets the same `PORT` OmniRoute logged.

**Dashboard 404 / cookies fail** — Set `NEXT_PUBLIC_BASE_URL` to the public HTTPS origin (no trailing slash) and `AUTH_COOKIE_SECURE=true`.

See also: [Docker Guide](./DOCKER_GUIDE.md), [Vercel Guide](./VERCEL.md), [Setup Guide](./SETUP_GUIDE.md), [Environment Variables](../reference/ENVIRONMENT.md).
