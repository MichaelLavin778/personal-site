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

This repo uses GitHub Actions to gate direct updates into `production`.

### Workflows

- `CI` (`.github/workflows/ci.yml`): runs `npm ci`, `npm run lint`, `npm run build`, and `npx playwright test` on PRs, and on pushes to `main`.
- `Promote main -> production` (`.github/workflows/promote-to-production.yml`): weekly and manually triggered workflow that re-runs lint/build and then pushes `main` directly to `production`.
	- Includes Playwright E2E checks against the `main` URL.
	- Runs every Friday at 4:17 PM `America/Denver`.

### One-time GitHub settings (required)

In GitHub: `Settings` → `Branches` → `Branch protection rules`, ensure the workflow can update `production` directly:

- Do not enable: "Require a pull request before merging"
- Remove any branch protection or ruleset restriction that blocks direct pushes from this GitHub Actions workflow.
- The workflow uses a normal fast-forward push and fails instead of overwriting divergent `production` history.

### How to promote manually

1. Go to `Actions` → `Promote main -> production` → `Run workflow`.
2. Wait for the workflow to pass.
3. The workflow pushes `main` directly to `production`.

The weekly scheduled promotion follows the same gated direct-push flow automatically.

## Authors

[Michael Lavin](https://www.linkedin.com/in/michael-lavin-2373b7198/)
