import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { Timestamp, arrayRemove } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { generate } from 'shortid';
import { useCurrentUserStore } from '@hooks';
import { MeetingComment } from '@types';
import { updateDocument } from '@utils';
import { Comment } from './Comment';
import { MeetingCommentForm } from './CommentForm';
import { StyledCommentList } from './styles';

interface CommentListProps {
  comments: MeetingComment[];
}

export const CommentList = ({ comments }: CommentListProps) => {
  const { id } = useParams();
  const { activeClub } = useCurrentUserStore();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState<
    number | null
  >(null);

  const handleDeleteComment = (commentIndex: number | null) => {
    if (id && commentIndex !== null) {
      updateDocument(
        `clubs/${activeClub?.docId}/meetings`,
        {
          comments: arrayRemove(comments[commentIndex]),
        },
        id
      ).then(() => {
        handleClose();
      });
    }
  };

  const handleClose = () => {
    setConfirmationDialogOpen(null);
  };

  const handleUpdateExistingComment = (
    comment: MeetingCommentForm,
    index: number
  ) => {
    if (id && activeClub) {
      const updatedComments = [...comments];
      updatedComments[index] = {
        ...updatedComments[index],
        ...comment,
        dateModified: Timestamp.now(),
      };

      if (updatedComments[index])
        updateDocument(
          `clubs/${activeClub.docId}/meetings`,
          {
            comments: updatedComments,
          },
          id
        );
    }
  };

  return (
    <>
      <StyledCommentList>
        {comments.map((comment, index) => (
          <Comment
            key={generate()}
            comment={comment}
            commentIndex={index}
            onUpdateExistingComment={(comment: MeetingCommentForm) =>
              handleUpdateExistingComment(comment, index)
            }
            onDeleteComment={() => setConfirmationDialogOpen(index)}
          />
        ))}
      </StyledCommentList>

      <Dialog
        open={confirmationDialogOpen !== null}
        onClose={handleClose}
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button
            onClick={() => handleDeleteComment(confirmationDialogOpen)}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
