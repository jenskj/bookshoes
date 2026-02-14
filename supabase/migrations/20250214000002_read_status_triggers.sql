-- readStatus triggers (replace Firebase Cloud Functions)

-- Trigger 1: On book insert/update (scheduled_meetings change)
CREATE OR REPLACE FUNCTION update_book_read_status()
RETURNS TRIGGER AS $$
DECLARE
  meeting_date TIMESTAMPTZ;
BEGIN
  -- New book: default to candidate
  IF TG_OP = 'INSERT' AND (NEW.read_status IS NULL OR NEW.read_status = '') THEN
    NEW.read_status := 'candidate';
    RETURN NEW;
  END IF;

  -- No scheduled meetings: candidate
  IF NEW.scheduled_meetings IS NULL OR array_length(NEW.scheduled_meetings, 1) IS NULL THEN
    NEW.read_status := 'candidate';
    RETURN NEW;
  END IF;

  -- Check if any scheduled meeting is in the future
  SELECT m.date INTO meeting_date
  FROM public.meetings m
  WHERE m.id = ANY(NEW.scheduled_meetings)
  ORDER BY m.date DESC NULLS LAST
  LIMIT 1;

  IF meeting_date IS NULL THEN
    NEW.read_status := 'candidate';
  ELSIF meeting_date > NOW() THEN
    NEW.read_status := 'reading';
  ELSE
    NEW.read_status := 'read';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_read_status_trigger
  BEFORE INSERT OR UPDATE OF scheduled_meetings, read_status ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_book_read_status();

-- Trigger 2: On meeting update (date change)
CREATE OR REPLACE FUNCTION on_meeting_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.date IS NOT DISTINCT FROM NEW.date THEN
    RETURN NEW;
  END IF;

  UPDATE public.books
  SET read_status = CASE
    WHEN NEW.date > NOW() THEN 'reading'
    ELSE 'read'
  END,
  modified_at = NOW()
  WHERE club_id = NEW.club_id
    AND NEW.id = ANY(scheduled_meetings);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_updated_trigger
  AFTER UPDATE OF date ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION on_meeting_updated();

-- Trigger 3: On meeting delete - remove meeting from books' scheduled_meetings and reset status
CREATE OR REPLACE FUNCTION on_meeting_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET scheduled_meetings = array_remove(scheduled_meetings, OLD.id),
      read_status = CASE
        WHEN array_length(array_remove(scheduled_meetings, OLD.id), 1) IS NULL THEN 'candidate'
        ELSE read_status
      END,
      modified_at = NOW()
  WHERE club_id = OLD.club_id AND OLD.id = ANY(scheduled_meetings);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_deleted_trigger
  BEFORE DELETE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION on_meeting_deleted();
