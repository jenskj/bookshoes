# Club Lifecycle QA Checklist

Use this checklist before merging governance or club-creation changes.

## Prerequisites

- A logged-in test user with permission to create clubs.
- Supabase project has all migrations applied from `/supabase/migrations`.

## Workflow

1. Create a club from `/clubs` with:
   - Public visibility
   - Private visibility
2. Confirm redirect to `/clubs/:id/admin` succeeds.
3. Hard-reload `/clubs/:id/admin`.
   - Expected: no transient access-denied flash for valid admins.
4. Update and save General profile fields on admin page.
   - Expected: success toast and persisted values after reload.
5. Update and save configuration fields on admin page.
   - Expected: success toast and persisted values after reload.
6. Return to `/clubs/:id` and verify updated profile/config surfaces correctly.
7. Switch active club in context bar and reload app.
   - Expected: active club and membership hydration remain correct.

## Role Workflow

1. As admin:
   - Promote/demote members.
   - Remove standard and moderator members.
2. As moderator:
   - Approve/deny join requests.
   - Remove only standard members.
   - Verify role-change and invite-management controls are not available.
3. As standard member:
   - Verify no moderation/admin controls are available.

## Invite and Join Request Workflow

1. Admin creates invite link.
2. Non-member accepts invite link.
   - Expected: user joins club and member count updates.
3. For private club without invite:
   - Non-member submits join request.
   - Moderator/admin approves and user becomes member.

## Pass Criteria

- No runtime errors in browser console.
- No permission bypasses observed in UI.
- `pnpm run lint`, `pnpm exec vitest run`, and `pnpm run build` pass.
