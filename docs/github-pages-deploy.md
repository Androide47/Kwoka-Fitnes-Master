# Deploy landing + mobileapp to GitHub Pages

This repo deploys two frontends to one GitHub Pages site via GitHub Actions:

| App | Stack | URL path |
| --- | --- | --- |
| Landing | React + TypeScript + Vite | `/` (site root) |
| Mobile app | Expo / React Native (web export) | `/app/` |

For this repository, that maps to:

- Landing: `https://<owner>.github.io/Kwoka-Fitnes-Master/`
- Mobile web: `https://<owner>.github.io/Kwoka-Fitnes-Master/app/`

GitHub Pages hosts **one** site per repo. The landing is the homepage; the mobile web build is nested under `/app/`. Open that path (or use **Open web app** on the landing download section) to reach the Expo app.

The workflow file is [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml). It runs on pushes to `main` that touch `landing/**` or `mobileapp/**`, and can also be run manually (**Actions → Deploy GitHub Pages → Run workflow**).

## One-time GitHub setup

### 1. Enable GitHub Pages (Actions source)

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Do not pick a branch/`/docs` folder source; the workflow uploads the built artifact.

### 2. Allow the workflow to deploy Pages

The workflow already requests:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

If your organization restricts Pages deployments:

1. **Settings** → **Actions** → **General**.
2. Under **Workflow permissions**, allow read and write (or ensure the job can use `pages: write` / OIDC).
3. Confirm **Pages** is not blocked by org policy.

No personal access token (PAT) is required for same-repo Pages deploy. GitHub Actions uses the built-in `GITHUB_TOKEN` and OIDC (`id-token: write`) with `actions/deploy-pages`.

### 3. Configure repository secrets (credentials / env)

Open **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

| Secret name | Required | Used by | Description |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Recommended | mobileapp web build | Backend API base URL baked into the Expo web bundle (e.g. `https://api.example.com`). If unset, the app falls back to `http://localhost:8000` (not useful for visitors on GitHub Pages). |

Optional later (add to the workflow `env:` when the landing app starts calling a real API):

| Secret / variable | Used by | Description |
| --- | --- | --- |
| `VITE_API_URL` | landing | Public API URL for the Vite site (`import.meta.env.VITE_API_URL`). |

**Rules of thumb**

- Only put **public** client-side values in `EXPO_PUBLIC_*` / `VITE_*` secrets. Anything prefixed that way is visible in the built JS.
- Never store private API keys, database passwords, or admin tokens in these secrets for frontend builds.
- Prefer **repository secrets** for values that differ per environment; use **variables** for non-sensitive flags.

#### Local development equivalents

Landing (optional `.env` in `landing/`):

```bash
# landing/.env
VITE_BASE_PATH=/
# VITE_API_URL=https://api.example.com
```

Mobile app (optional `.env` in `mobileapp/`):

```bash
# mobileapp/.env
EXPO_PUBLIC_API_URL=http://localhost:8000
# For GitHub Pages-style subdirectory locally:
# EXPO_BASE_URL=/Kwoka-Fitnes-Master/app
```

Do not commit real `.env` files. Keep examples only in docs or `*.env.example` files.

### 4. First deploy checklist

1. Secrets set (at least `EXPO_PUBLIC_API_URL` if you have a backend).
2. Pages source = **GitHub Actions**.
3. Merge to `main` or run the workflow manually.
4. Open **Actions** and confirm **Deploy GitHub Pages** succeeds.
5. Visit the Pages URL from **Settings → Pages** (or the deploy job’s environment URL).

## How the build paths work

GitHub project sites live under `/<repo-name>/`, not the domain root.

- Landing Vite `base` is set from `VITE_BASE_PATH` (workflow: `/Kwoka-Fitnes-Master/`).
- React Router uses `import.meta.env.BASE_URL` as `basename`.
- Expo web uses `EXPO_BASE_URL` (workflow: `/Kwoka-Fitnes-Master/app`) via `app.config.js` → `experiments.baseUrl`.
- The workflow copies landing into `_site/` and the Expo web export into `_site/app/`, then uploads that folder as the Pages artifact.

## Package manager

CI uses **Bun** (`oven-sh/setup-bun`) with each app’s `bun.lock`:

```bash
bun install --frozen-lockfile
bun run build          # landing
bunx expo export -p web  # mobileapp
```

Keep `bun.lock` committed and in sync with `package.json`. Prefer Bun locally for these apps so lockfiles stay aligned with CI.

## Manual local preview of the Pages layout

```bash
# Landing
cd landing
bun install --frozen-lockfile
VITE_BASE_PATH=/Kwoka-Fitnes-Master/ bun run build

# Mobile web
cd ../mobileapp
bun install --frozen-lockfile
EXPO_BASE_URL=/Kwoka-Fitnes-Master/app EXPO_PUBLIC_API_URL=https://api.example.com bunx expo export -p web

# Assemble like CI
mkdir -p ../_site/app
cp -R ../landing/dist/. ../_site/
cp -R dist/. ../_site/app/
bunx serve ../_site
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `bun install --frozen-lockfile` fails | From the app folder run `bun install`, commit the updated `bun.lock`, push. |
| 404 on refresh of a client route | Workflow already copies `index.html` → `404.html` for landing and `/app`. Re-run deploy if that step failed. |
| Blank page / assets 404 | Confirm `VITE_BASE_PATH` / `EXPO_BASE_URL` match `/<repo-name>/` and `/<repo-name>/app`. |
| Workflow cannot deploy | Pages source must be **GitHub Actions**; check org Pages / Actions permissions. |
| Mobile app calls localhost | Set repository secret `EXPO_PUBLIC_API_URL` to your public API URL and redeploy. |
| Secret not updating the bundle | Secrets are applied at **build** time. Change the secret, then re-run the workflow. |

## Security notes

- Treat frontend env as public.
- Rotate any secret that was ever committed to git history.
- If you later need a private deploy token (forks, cross-repo publish), create a fine-scoped PAT or GitHub App token, store it as a secret (e.g. `PAGES_DEPLOY_TOKEN`), and document that separately — the default same-repo flow does not need it.
