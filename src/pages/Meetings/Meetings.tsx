import { useState } from 'react';
import { Meeting, MeetingForm } from '../../components';
import { FirestoreMeeting } from '../../types';
import {
  StyledAddNewButton,
  StyledButtonWrapper,
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';
import { useMeetingStore, useBookStore } from '../../hooks';

export const Meetings = () => {
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
        <StyledButtonWrapper>
          <StyledAddNewButton onClick={() => openModal(null)}>
            +
          </StyledAddNewButton>
        </StyledButtonWrapper>
        <StyledMeetingContainer>
          {meetings.map((meeting) => (
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
