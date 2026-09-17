---
title: "Vercel Deployment — OmniRoute"
version: 3.8.51
lastUpdated: 2026-09-17
---

# Vercel Deployment — OmniRoute

Deploy the OmniRoute dashboard and OpenAI-compatible API to [Vercel](https://vercel.com) as a Next.js app.

> This is a **preview / demo** hosting path. OmniRoute is designed as a long-running Node process with a local SQLite file. Vercel Functions have an ephemeral filesystem, so provider keys, API keys, and settings **do not survive** instance recycling or redeploys. For a durable gateway, use Docker, a VPS, or the desktop app.

## Limitations

| Capability                          | On Vercel                                     |
| ----------------------------------- | --------------------------------------------- |
| Dashboard + `/v1` API               | Supported                                     |
| SQLite persistence                  | Ephemeral (`/tmp/omniroute`)                  |
| Live dashboard WebSocket (20132)    | Disabled                                      |
| Background quota/model schedulers   | Disabled                                      |
| MITM / Agent Bridge / TPROXY        | Disabled                                      |
| Custom Node server (`run-next.mjs`) | Not used; Vercel serves Next.js routes        |
| Streaming chat                      | Supported (Fluid Compute, `maxDuration` 300s) |

## 1. Import the repo

1. Push this project to GitHub (or connect the existing remote).
2. In Vercel: **Add New → Project** and import the repository.
3. Framework Preset: **Next.js** (detected from `vercel.json`).
4. Node.js version: **22.x** or **24.x** (Project Settings → General). OmniRoute requires `>=22.22.2 <23` or `>=24.0.0 <27`.

## 2. Set environment variables

In **Project Settings → Environment Variables**, set at least:

| Name                   | Example / how to generate                    | Required    |
| ---------------------- | -------------------------------------------- | ----------- |
| `JWT_SECRET`           | `openssl rand -base64 48`                    | **Yes**     |
| `API_KEY_SECRET`       | `openssl rand -hex 32`                       | **Yes**     |
| `INITIAL_PASSWORD`     | A strong password (change after first login) | **Yes**     |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project.vercel.app`            | **Yes**     |
| `AUTH_COOKIE_SECURE`   | `true`                                       | Recommended |
| `REQUIRE_API_KEY`      | `true`                                       | Recommended |

`vercel.json` already supplies:

- `DATA_DIR=/tmp/omniroute`
- `OMNIROUTE_DISABLE_BACKGROUND_SERVICES=1`
- `OMNIROUTE_ENABLE_LIVE_WS=0`
- `OMNIROUTE_MITM_STUB=1`
- `OMNIROUTE_USE_TURBOPACK=0` (webpack build — bounded heap on Vercel)

If `JWT_SECRET` / `API_KEY_SECRET` are omitted, OmniRoute generates them on cold start. Those values are lost when the instance recycles, which invalidates dashboard sessions and encrypted API keys. **Pin them in the Vercel dashboard.**

## 3. Deploy

```bash
npx vercel --prod
```

Or push to the connected Git branch. The first production build can take several minutes and needs ~8 GB of build memory (Vercel Pro is recommended if Hobby OOMs).

After deploy:

- Dashboard: `https://<your-app>.vercel.app/dashboard`
- API base: `https://<your-app>.vercel.app/v1`
- First login password: the `INITIAL_PASSWORD` you set

## 4. Point an IDE / CLI at it

```
Base URL: https://<your-app>.vercel.app/v1
API Key:  [create one in Dashboard → API Keys]
Model:    auto
```

Re-add providers after each redeploy; `/tmp` storage is not durable.

## Troubleshooting

**Build OOM** — In Vercel Project Settings, confirm Node 22/24 and that the build command is `npm run build`. Hobby plans may run out of memory on a full dashboard compile; upgrade or use Docker instead.

**`Cannot find module 'better-sqlite3'`** — Expected on some Vercel images. The driver cascade falls through to `node:sqlite` (Node 22.5+) or `sql.js` WASM.

**Sessions expire after idle** — Secrets were not pinned; set `JWT_SECRET` and `API_KEY_SECRET` as durable project env vars.

**Streaming cuts off at ~5 minutes** — Hobby Fluid Compute caps `maxDuration` at 300s. Pro can raise it in the dashboard.

See also: [Docker Guide](./DOCKER_GUIDE.md), [Setup Guide](./SETUP_GUIDE.md), [Environment Variables](../reference/ENVIRONMENT.md).
