# Bookshoes

A book club app (React + Vite frontend, Firebase Functions backend).

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (or enable Corepack: `corepack enable`)

## Install

From the repo root:

```bash
pnpm install
```

This installs dependencies for both the root app and the `bookshoesfns` workspace package.

## Scripts (root)

| Command | Description |
|---------|-------------|
| `pnpm start` | Start the Vite dev server |
| `pnpm run build` | Production build (output in `build/`) |
| `pnpm run preview` | Preview the production build |
| `pnpm test` | Run Vitest |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Build and deploy to GitHub Pages |

## Firebase Functions (bookshoesfns)

From the root you can run functions scripts with the filter:

```bash
pnpm --filter functions run build   # Build TypeScript
pnpm --filter functions run lint    # Lint
pnpm --filter functions run serve   # Build + start emulators (auth, functions, firestore, database)
```

Or from the `bookshoesfns` directory:

```bash
cd bookshoesfns
pnpm run build
pnpm run serve
```

Firebase deploy (from root) will run the functions build via the predeploy hook in `firebase.json` using pnpm.
