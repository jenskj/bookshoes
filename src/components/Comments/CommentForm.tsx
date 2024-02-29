import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { FormControl, IconButton, TextField, Tooltip } from '@mui/material';
import { Timestamp, arrayUnion } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { updateDocument } from '@utils';
import {
  StyledAddCommentForm,
  StyledPostButton,
  StyledTextContainer,
} from './styles';

export interface MeetingCommentForm {
  text?: string;
  title?: string;
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
  });

  useEffect(() => {
    if (editForm) {
      setForm(editForm);
    }
  }, [editForm]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Boolean(editForm) && onUpdateExistingComment) {
      onUpdateExistingComment(form);
    } else {
      if (form?.text && currentUser && id) {
        updateDocument(
          `clubs/${activeClub?.docId}/meetings/`,
          {
            comments: arrayUnion({
              text: form?.text,
              title: form?.title || '',
              user: currentUser?.data,
              dateAdded: Timestamp.now(),
              type: 'comment',
            }),
          },
          id
        ).then(() => {
          setForm({ text: '', title: '' });
        });
      }
    }
  };

  return (
    <StyledAddCommentForm onSubmit={handleSubmit}>
      <StyledTextContainer>
        {editForm ? (
          <Tooltip title="Go back">
            <IconButton
              aria-label="Go back"
              size="small"
              onClick={onCancelEdit}
            >
              <HighlightOffIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <FormControl fullWidth sx={{ gap: 1 }}>
          <TextField
            label="Title"
            size="small"
            value={form?.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Comment"
            value={form?.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            multiline
            required
            InputLabelProps={{ required: false }}
            rows={2}
            placeholder="Add a comment..."
          />
        </FormControl>
      </StyledTextContainer>
      <StyledPostButton variant="contained" type="submit">
        {editForm ? 'Update' : 'Post'}
      </StyledPostButton>
    </StyledAddCommentForm>
  );
};
