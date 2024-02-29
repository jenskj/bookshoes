import { useMeetingStore } from '@hooks';
import { FirestoreMeeting } from '@types';
import { useEffect, useState } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { StyledCommentSection } from './styles';

interface CommentSectionProps {
  meetingId?: string;
}

export const CommentSection = ({ meetingId }: CommentSectionProps) => {
  const { meetings } = useMeetingStore();
  const [currentMeeting, setCurrentMeeting] = useState<FirestoreMeeting>();

  useEffect(() => {
    if (meetings && meetingId) {
      const meeting: FirestoreMeeting | undefined = meetings?.find(
        (m) => m.docId === meetingId
      );
      if (meeting) {
        setCurrentMeeting(meeting);
      }
    }
  }, [meetings, meetingId]);

  return (
    <StyledCommentSection>
      <CommentList comments={currentMeeting?.data.comments || []} />
      <CommentForm />
    </StyledCommentSection>
  );
};
