# Running the Application

## Environment URLs

This project uses one env selector (`VITE_APP_ENV`) to choose the correct base URL.

- **local**: `http://localhost:5173/`
- **main**: `https://main.d1y82t1cx4u01s.amplifyapp.com/`
- **production**: `https://production.d1y82t1cx4u01s.amplifyapp.com/`

### Set the environment (PowerShell)

```powershell
$env:VITE_APP_ENV = "local"
npm run dev

$env:VITE_APP_ENV = "main"
npx playwright test
```

local - [localhost:5173/](localhost:5173/):
```
npm install
npm run dev
```

## Release pipeline (main -> production)

This repo uses GitHub Actions to gate merges into `production`.

### Workflows

- `CI` (`.github/workflows/ci.yml`): runs `npm ci`, `npm run lint`, `npm run build`, and `npx playwright test` on PRs, and on pushes to `main`.
- `Promote main -> production` (`.github/workflows/promote-to-production.yml`): manual workflow that re-runs lint/build and then opens a PR from `main` into `production`.
	- Includes Playwright E2E checks against the `production` URL.

### One-time GitHub settings (required)

In GitHub: `Settings` → `Branches` → `Branch protection rules` → add rule for `production`:

- Enable: "Require a pull request before merging"
- Enable: "Require status checks to pass before merging"
	- Select required check: `CI / Lint & Build`
- (Recommended) Enable: "Require branches to be up to date before merging"
- (Optional) Enable: "Include administrators"

### How to promote

1. Go to `Actions` → `Promote main -> production` → `Run workflow`.
2. Wait for the workflow to pass.
3. Open the PR it created and merge it into `production` (merge button will be blocked until checks are green).

## Authors

[Michael Lavin](https://www.linkedin.com/in/michael-lavin-2373b7198/)
