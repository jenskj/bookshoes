# Archived Migration Scripts

These scripts were used for the one-time Firestore → Supabase migration. They require `firebase-admin` and are kept for reference only.

To run them (e.g. for another project), you would need to:
1. Add `firebase-admin`: `pnpm add -D firebase-admin`
2. Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env.migration`

The migration is complete; these are no longer needed for normal operation.

See `docs/archive/FIRESTORE_TO_SUPABASE_MIGRATION.md` for the full migration plan.
