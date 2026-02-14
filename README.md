# Bookshoes

A book club app (React + Vite frontend, Supabase backend).

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (or enable Corepack: `corepack enable`)

## Install

From the repo root:

```bash
pnpm install
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Google Auth in Authentication > Providers
3. Run the SQL migrations in `supabase/migrations/` (in order) via the Supabase SQL Editor
4. Copy your project URL and anon key from Settings > API
5. Create `.env.local` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_BOOKS_API=your-google-books-api-key
```

## Scripts (root)

| Command | Description |
|---------|-------------|
| `pnpm start` | Start the Vite dev server |
| `pnpm run build` | Production build (output in `build/`) |
| `pnpm run preview` | Preview the production build |
| `pnpm test` | Run Vitest |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Build and deploy to GitHub Pages |
