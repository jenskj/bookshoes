import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { runOptimisticMutation } from '@lib/optimistic';
import { useToast } from '@lib/ToastContext';
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
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const { showError } = useToast();
  const [optimisticComments, setOptimisticComments] = useState(comments);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState<
    number | null
  >(null);

  useEffect(() => {
    setOptimisticComments(comments);
  }, [comments]);

  const handleDeleteComment = async (commentIndex: number | null) => {
    if (!activeClub?.docId) {
      showError('Select an active club before editing comments.');
      return;
    }
    if (id && commentIndex !== null) {
      const nextComments = optimisticComments.filter(
        (_, index) => index !== commentIndex
      );
      await runOptimisticMutation({
        getSnapshot: () => optimisticComments,
        apply: () => {
          setOptimisticComments(nextComments);
        },
        commit: async () => {
          await updateMeeting(activeClub.docId as string, id, {
            comments: nextComments,
          });
        },
        rollback: (snapshot) => {
          setOptimisticComments(snapshot);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : String(error));
        },
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setConfirmationDialogOpen(null);
  };

  const handleUpdateExistingComment = (
    comment: MeetingCommentForm,
    index: number
  ) => {
    if (!activeClub?.docId) {
      showError('Select an active club before editing comments.');
      return;
    }
    if (id) {
      const updatedComments = [...optimisticComments];
      updatedComments[index] = {
        ...updatedComments[index],
        ...comment,
        dateModified: new Date().toISOString(),
      };

      if (updatedComments[index]) {
        void runOptimisticMutation({
          getSnapshot: () => optimisticComments,
          apply: () => {
            setOptimisticComments(updatedComments);
          },
          commit: async () => {
            await updateMeeting(activeClub.docId as string, id, {
              comments: updatedComments,
            });
          },
          rollback: (snapshot) => {
            setOptimisticComments(snapshot);
          },
          onError: (error) => {
            showError(error instanceof Error ? error.message : String(error));
          },
        });
      }
    }
  };

  return (
    <>
      <StyledCommentList>
        {optimisticComments.map((comment, index) => (
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
