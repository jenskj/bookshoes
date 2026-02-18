-- User-level settings/preferences stored as JSONB.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;
