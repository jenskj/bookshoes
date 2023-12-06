import { useEffect, useState } from 'react';
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
import { isBefore } from 'date-fns';

interface MeetingsProps {
  isPreview?: boolean;
}

export const Meetings = ({ isPreview = false }: MeetingsProps) => {
  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const [displayedMeetings, setDisplayedMeetings] =
    useState<FirestoreMeeting[]>();
  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);

  useEffect(() => {
    if (meetings) {
      const meetingList: FirestoreMeeting[] = [];
      meetings.forEach((meeting) => {
        if (
          isPreview &&
          meeting.data.date &&
          isBefore(new Date(), meeting?.data.date?.toDate())
        ) {
          meetingList.push(meeting);
        } else if (!isPreview) {
          meetingList.push(meeting);
        }
        setDisplayedMeetings(meetingList);
        console.log(meetingList);
      });
    }
  }, [meetings, isPreview]);

  const openModal = (index: number | null) => {
    if (index !== null) {
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  return (
    <>
      <StyledMeetingList>
        {!isPreview && (
          <StyledButtonWrapper>
            <StyledAddNewButton onClick={() => openModal(null)}>
              +
            </StyledAddNewButton>
          </StyledButtonWrapper>
        )}
        <StyledMeetingContainer>
          {displayedMeetings &&
            displayedMeetings.map((meeting) => (
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
