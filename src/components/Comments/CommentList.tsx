import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { MeetingComment } from '@types';
import { updateMeeting } from '@utils';
import { Comment } from './Comment';
import { MeetingCommentForm } from './CommentForm';
import { StyledCommentList } from './styles';
import { ConfirmationDialog } from '@components';

interface CommentListProps {
  comments: MeetingComment[];
  viewerPage: number;
}

export const CommentList = ({ comments, viewerPage }: CommentListProps) => {
  const { id } = useParams();
  const { activeClub } = useCurrentUserStore();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState<
    number | null
  >(null);

  const handleDeleteComment = (commentIndex: number | null) => {
    if (id && commentIndex !== null) {
      updateMeeting(activeClub!.docId, id, {
        commentsRemove: comments[commentIndex],
      }).then(() => {
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
        updateMeeting(activeClub.docId, id, {
          comments: updatedComments,
        });
    }
  };

  return (
    <>
      <StyledCommentList>
        {comments.map((comment, index) => (
          <Comment
            key={comment.dateAdded + index}
            comment={comment}
            viewerPage={viewerPage}
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
