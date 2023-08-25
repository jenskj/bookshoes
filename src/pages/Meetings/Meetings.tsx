import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FirestoreBook } from '..';
import { Meeting, MeetingForm } from '../../components';
import { firestore } from '../../firestore';
import {
  StyledAddNewButton,
  StyledButtonWrapper,
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';

export interface MeetingInfo {
  date?: string;
  location?: string;
  books?: FirestoreBook[] | [];
}

export interface FirestoreMeeting {
  docId: string;
  data: MeetingInfo;
}

export const Meetings = () => {
  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);

  useEffect(() => {
    firestore.collection('meetings').onSnapshot((snapshot) => {
      const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as MeetingInfo,
      })) as FirestoreMeeting[];
      setMeetings(newMeetings);
    });
  }, []);

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
              <Meeting meeting={meeting.data} />
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
