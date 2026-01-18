# Running the Application

local - [localhost:5173/](localhost:5173/):
```
npm install --legacy-peer-deps
npm run dev
```

production - [here](https://main.d1y82t1cx4u01s.amplifyapp.com/)
```
npm install --legacy-peer-deps
npm run build
```

## Release pipeline (main -> production)

This repo uses GitHub Actions to gate merges into `production`.

### Workflows

- `CI` (`.github/workflows/ci.yml`): runs `npm ci`, `npm run lint`, `npm run build` on PRs, and on pushes to `main`.
- `Promote main -> production` (`.github/workflows/promote-to-production.yml`): manual workflow that re-runs lint/build and then opens a PR from `main` into `production`.

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
