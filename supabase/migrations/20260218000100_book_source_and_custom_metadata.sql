-- Add provider-neutral metadata to support Google, Open Library, and manual books.
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS source_book_id TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS isbn_10 TEXT,
  ADD COLUMN IF NOT EXISTS isbn_13 TEXT,
  ADD COLUMN IF NOT EXISTS metadata_raw JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  ALTER TABLE public.books
    ADD CONSTRAINT books_source_check
    CHECK (source IN ('google', 'open_library', 'manual'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.books
SET
  source = CASE
    WHEN google_id IS NULL THEN 'manual'
    ELSE 'google'
  END,
  source_book_id = COALESCE(source_book_id, google_id),
  cover_url = COALESCE(cover_url, image_thumbnail),
  metadata_raw = COALESCE(metadata_raw, '{}'::jsonb);

DO $$
BEGIN
  ALTER TABLE public.books
    ADD CONSTRAINT books_source_book_id_required
    CHECK (source = 'manual' OR source_book_id IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_books_club_source_book_id
  ON public.books (club_id, source, source_book_id);

CREATE INDEX IF NOT EXISTS idx_books_club_isbn_13
  ON public.books (club_id, isbn_13);

CREATE INDEX IF NOT EXISTS idx_books_club_isbn_10
  ON public.books (club_id, isbn_10);
