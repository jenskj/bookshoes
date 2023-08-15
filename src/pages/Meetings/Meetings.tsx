import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FirestoreBook } from '..';
import { Meeting, MeetingForm } from '../../components';
import { firestore } from '../../firestore';
import {
  StyledAddNewButton,
  StyledAddNewButtonWrapper,
  StyledMeetingList,
} from './styles';

export interface MeetingInfo {
  date?: string;
  location?: string;
  books?: FirestoreBook[];
}

export interface FirestoreMeeting {
  id: string;
  data: MeetingInfo;
}

export const Meetings = () => {
  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);

  useEffect(() => {
    firestore.collection('meetings').onSnapshot((snapshot) => {
      const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
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
      <div>
        <StyledMeetingList>
          <StyledAddNewButtonWrapper>
            <StyledAddNewButton onClick={() => openModal(null)}>+</StyledAddNewButton>
          </StyledAddNewButtonWrapper>
          {meetings.map((meeting, index) => (
            <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
              <Meeting meeting={meeting.data} />
            </Link>
          ))}
        </StyledMeetingList>

        <MeetingForm
          currentId={activeMeeting?.id}
          open={activeModal}
          onClose={() => setActiveModal(false)}
        />
      </div>
    </>
  );
};
