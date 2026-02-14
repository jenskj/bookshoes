import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { MeetingComment } from '@types';
import { updateDocument } from '@utils';
import { Comment } from './Comment';
import { MeetingCommentForm } from './CommentForm';
import { StyledCommentList } from './styles';
import { ConfirmationDialog } from '@components';

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
          commentsRemove: comments[commentIndex],
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
        dateModified: new Date().toISOString(),
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
            key={comment.dateAdded + index}
            comment={comment}
            commentIndex={index}
            onUpdateExistingComment={(comment: MeetingCommentForm) =>
              handleUpdateExistingComment(comment, index)
            }
            onDeleteComment={() => setConfirmationDialogOpen(index)}
          />
        ))}
      </StyledCommentList>

      <ConfirmationDialog
        isOpen={confirmationDialogOpen !== null}
        onClose={handleClose}
        onConfirm={() => handleDeleteComment(confirmationDialogOpen)}
        promptText="Are you sure you want to delete this comment?"
      />
    </>
  );
};
