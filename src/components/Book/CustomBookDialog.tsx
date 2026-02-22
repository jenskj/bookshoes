import { UIButton, UIInput, UITextarea } from '@components/ui';
import { useToast } from '@lib/ToastContext';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import type { CustomBookInput } from '@types';
import { useEffect, useMemo, useState } from 'react';

interface CustomBookDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CustomBookInput) => Promise<void>;
}

interface CustomBookFormState {
  title: string;
  authors: string;
  description: string;
  pageCount: string;
  publishedDate: string;
  publisher: string;
  coverUrl: string;
  isbn10: string;
  isbn13: string;
}

const EMPTY_FORM: CustomBookFormState = {
  title: '',
  authors: '',
  description: '',
  pageCount: '',
  publishedDate: '',
  publisher: '',
  coverUrl: '',
  isbn10: '',
  isbn13: '',
};

const StyledFieldGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
}));

export const CustomBookDialog = ({
  open,
  onClose,
  onCreate,
}: CustomBookDialogProps) => {
  const { showError } = useToast();
  const [form, setForm] = useState<CustomBookFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSaving(false);
    }
  }, [open]);

  const authors = useMemo(
    () => form.authors.split(',').map((entry) => entry.trim()).filter(Boolean),
    [form.authors]
  );

  const setField = (field: keyof CustomBookFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      showError('Title is required.');
      return;
    }
    if (!authors.length) {
      showError('At least one author is required.');
      return;
    }

    const pageCount =
      form.pageCount.trim().length > 0
        ? Number(form.pageCount)
        : undefined;
    if (
      pageCount !== undefined &&
      (!Number.isFinite(pageCount) || pageCount <= 0)
    ) {
      showError('Page count must be a positive number.');
      return;
    }

    const payload: CustomBookInput = {
      title: form.title.trim(),
      authors,
      description: form.description.trim() || undefined,
      pageCount,
      publishedDate: form.publishedDate.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      coverUrl: form.coverUrl.trim() || undefined,
      isbn10: form.isbn10.trim() || undefined,
      isbn13: form.isbn13.trim() || undefined,
    };

    setSaving(true);
    try {
      await onCreate(payload);
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Custom Book</DialogTitle>
      <DialogContent>
        <StyledFieldGrid>
          <label>
            <div>Title</div>
            <UIInput
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Required"
            />
          </label>

          <label>
            <div>Authors</div>
            <UIInput
              value={form.authors}
              onChange={(event) => setField('authors', event.target.value)}
              placeholder="Required, comma-separated"
            />
          </label>

          <label>
            <div>Description</div>
            <UITextarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </label>

          <label>
            <div>Page Count</div>
            <UIInput
              value={form.pageCount}
              onChange={(event) => setField('pageCount', event.target.value)}
              type="number"
              min={1}
            />
          </label>

          <label>
            <div>Published Date</div>
            <UIInput
              value={form.publishedDate}
              onChange={(event) => setField('publishedDate', event.target.value)}
              placeholder="YYYY or YYYY-MM-DD"
            />
          </label>

          <label>
            <div>Publisher</div>
            <UIInput
              value={form.publisher}
              onChange={(event) => setField('publisher', event.target.value)}
            />
          </label>

          <label>
            <div>Cover URL</div>
            <UIInput
              value={form.coverUrl}
              onChange={(event) => setField('coverUrl', event.target.value)}
            />
          </label>

          <label>
            <div>ISBN-10</div>
            <UIInput
              value={form.isbn10}
              onChange={(event) => setField('isbn10', event.target.value)}
            />
          </label>

          <label>
            <div>ISBN-13</div>
            <UIInput
              value={form.isbn13}
              onChange={(event) => setField('isbn13', event.target.value)}
            />
          </label>
        </StyledFieldGrid>
      </DialogContent>
      <DialogActions>
        <UIButton variant="ghost" className="focus-ring" onClick={onClose} disabled={saving}>
          Cancel
        </UIButton>
        <UIButton
          variant="primary"
          className="focus-ring"
          onClick={() => void handleCreate()}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Add to shelf'}
        </UIButton>
      </DialogActions>
    </Dialog>
  );
};
