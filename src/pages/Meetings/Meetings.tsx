import { useState } from 'react';
import { Meeting, MeetingForm } from '../../components';
import { useBookStore, useMeetingStore } from '../../hooks';
import { FirestoreMeeting } from '../../types';
import {
  StyledAddNewButton,
  StyledButtonWrapper,
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';

interface MeetingsProps {
  displayedMeetings?: FirestoreMeeting[];
}

export const Meetings = ({ displayedMeetings }: MeetingsProps) => {
  const { meetings } = useMeetingStore();
  const { books } = useBookStore();

  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);

  const openModal = (index: number | null) => {
    if (index !== null) {
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  return (
    <>
      <StyledMeetingList>
        {!displayedMeetings && (
          <StyledButtonWrapper>
            <StyledAddNewButton onClick={() => openModal(null)}>
              +
            </StyledAddNewButton>
          </StyledButtonWrapper>
        )}
        <StyledMeetingContainer>
          {(meetings || displayedMeetings) &&
            (displayedMeetings || meetings).map((meeting) => (
              <StyledLink key={meeting.docId} to={`/meetings/${meeting.docId}`}>
                <Meeting
                  meeting={meeting.data}
                  books={books.filter(
                    (book) => book.data.scheduledMeeting === meeting.docId
                  )}
                />
              </StyledLink>
            ))}
        </StyledMeetingContainer>
      </StyledMeetingList>

      <MeetingForm
        currentId={activeMeeting?.docId}
        open={activeModal}
        onClose={() => setActiveModal(false)}
      />
    </>
  );
};
