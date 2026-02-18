import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { updateMeeting } from '@utils';
import {
  StyledAddCommentForm,
  StyledCheckboxRow,
  StyledFormRow,
  StyledInput,
  StyledLabel,
  StyledPostButton,
  StyledTextContainer,
  StyledTextarea,
} from './styles';

export interface MeetingCommentForm {
  text?: string;
  title?: string;
  citation?: {
    page?: number;
    chapter?: string;
  };
  spoiler?: {
    enabled: boolean;
    revealAfterPage?: number;
  };
}

interface CommentFormProps {
  editForm?: MeetingCommentForm;
  onCancelEdit?: () => void;
  onUpdateExistingComment?: (comment: MeetingCommentForm) => void;
}

export const CommentForm = ({
  editForm,
  onCancelEdit,
  onUpdateExistingComment,
}: CommentFormProps) => {
  const { id } = useParams();
  const { currentUser, activeClub } = useCurrentUserStore();
  const [form, setForm] = useState<MeetingCommentForm>({
    text: '',
    title: '',
    citation: { page: undefined, chapter: '' },
    spoiler: { enabled: false, revealAfterPage: undefined },
  });

  useEffect(() => {
    if (editForm) {
      setForm({
        text: editForm.text || '',
        title: editForm.title || '',
        citation: {
          page: editForm.citation?.page,
          chapter: editForm.citation?.chapter || '',
        },
        spoiler: {
          enabled: Boolean(editForm.spoiler?.enabled),
          revealAfterPage: editForm.spoiler?.revealAfterPage,
        },
      });
    }
  }, [editForm]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const citationPage = form.citation?.page;
    const spoilerEnabled = Boolean(form.spoiler?.enabled);
    const revealAfterPage = form.spoiler?.revealAfterPage;

    if (!form.text?.trim() || !citationPage || Number(citationPage) < 1) return;

    const payload: MeetingCommentForm = {
      text: form.text.trim(),
      title: form.title?.trim() || '',
      citation: {
        page: Number(citationPage),
        chapter: form.citation?.chapter?.trim() || '',
      },
      spoiler: spoilerEnabled
        ? {
            enabled: true,
            revealAfterPage:
              revealAfterPage && Number(revealAfterPage) > 0
                ? Number(revealAfterPage)
                : Number(citationPage),
          }
        : { enabled: false },
    };

    if (Boolean(editForm) && onUpdateExistingComment) {
      onUpdateExistingComment(payload);
      if (onCancelEdit) onCancelEdit();
      return;
    }

    if (!activeClub?.docId || !currentUser || !id) return;
    updateMeeting(activeClub.docId, id, {
      commentsAppend: {
        text: payload.text,
        title: payload.title,
        citation: payload.citation,
        spoiler: payload.spoiler,
        user: currentUser.data,
        dateAdded: new Date().toISOString(),
        type: 'comment',
      },
    }).then(() => {
      setForm({
        text: '',
        title: '',
        citation: { page: undefined, chapter: '' },
        spoiler: { enabled: false, revealAfterPage: undefined },
      });
    });
  };

  return (
    <StyledAddCommentForm onSubmit={handleSubmit}>
      <StyledTextContainer>
        <StyledLabel>
          Note title (optional)
          <StyledInput
            type="text"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nature as burden, not beauty"
          />
        </StyledLabel>
        <StyledLabel>
          Comment
          <StyledTextarea
            required
            value={form.text || ''}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Capture your argument in one precise paragraph."
          />
        </StyledLabel>
        <StyledFormRow>
          <StyledLabel>
            Citation page
            <StyledInput
              required
              type="number"
              min={1}
              value={form.citation?.page || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  citation: {
                    ...form.citation,
                    page: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </StyledLabel>
          <StyledLabel>
            Chapter (optional)
            <StyledInput
              type="text"
              value={form.citation?.chapter || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  citation: {
                    ...form.citation,
                    chapter: e.target.value,
                  },
                })
              }
              placeholder="Ch. 5"
            />
          </StyledLabel>
        </StyledFormRow>
        <StyledCheckboxRow>
          <input
            type="checkbox"
            checked={Boolean(form.spoiler?.enabled)}
            onChange={(e) =>
              setForm({
                ...form,
                spoiler: { ...form.spoiler, enabled: e.target.checked },
              })
            }
          />
          Mark as spoiler
        </StyledCheckboxRow>
        {form.spoiler?.enabled ? (
          <StyledLabel>
            Reveal only after page
            <StyledInput
              type="number"
              min={1}
              value={form.spoiler?.revealAfterPage || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  spoiler: {
                    enabled: true,
                    revealAfterPage: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  },
                })
              }
            />
          </StyledLabel>
        ) : null}
      </StyledTextContainer>
      <StyledPostButton type="submit" className="focus-ring">
        {editForm ? 'Update Note' : 'Post Note'}
      </StyledPostButton>
    </StyledAddCommentForm>
  );
};
