import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import { Meeting } from '@types';
import { useEffect, useState } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { StyledCommentSection } from './styles';

interface CommentSectionProps {
  meetingId?: string;
}

export const CommentSection = ({ meetingId }: CommentSectionProps) => {
  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const { currentUser } = useCurrentUserStore();
  const [currentMeeting, setCurrentMeeting] = useState<Meeting>();
  const [viewerPage, setViewerPage] = useState(0);

  useEffect(() => {
    if (meetings && meetingId) {
      const meeting: Meeting | undefined = meetings?.find(
        (m) => m.docId === meetingId
      );
      if (meeting) {
        setCurrentMeeting(meeting);
      }
    }
  }, [meetings, meetingId]);

  useEffect(() => {
    if (!meetingId || !currentUser?.docId) {
      setViewerPage(0);
      return;
    }
    const meetingBooks = books.filter((book) =>
      book.data.scheduledMeetings?.includes(meetingId)
    );
    const progress = meetingBooks
      .map(
        (book) =>
          book.data.progressReports?.find(
            (report) => report.user.uid === currentUser.docId
          )?.currentPage || 0
      )
      .reduce((highest, current) => Math.max(highest, current), 0);
    setViewerPage(progress);
  }, [books, currentUser?.docId, meetingId]);

  return (
    <StyledCommentSection>
      <CommentList comments={currentMeeting?.data.comments || []} viewerPage={viewerPage} />
      <CommentForm />
    </StyledCommentSection>
  );
};
