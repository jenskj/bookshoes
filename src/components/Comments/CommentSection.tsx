import { useEffect, useState } from 'react';
import { useMeetingStore } from '../../hooks';
import { FirestoreMeeting } from '../../types';
import { CommentList } from './CommentList';
import { StyledCommentSection } from './styles';
import { CommentForm } from './CommentForm';
import { StyledSectionHeading } from '@shared/styles';

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
      <StyledSectionHeading>Comments</StyledSectionHeading>
      <CommentList comments={currentMeeting?.data.comments || []} />
      <CommentForm />
    </StyledCommentSection>
  );
};
