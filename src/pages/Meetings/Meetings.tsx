import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FirestoreBook } from '..';
import { Meeting, MeetingForm } from '../../components';
import { firestore } from '../../firestore';
import { StyledAddNewButton, StyledMeeting, StyledMeetingList } from './styles';

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
  Modal.setAppElement('#root');
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

  const openModal = (index: number) => {
    if (index !== null) {
      console.log(index);
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  function closeModal() {
    setActiveModal(false);
  }
  return (
    <div style={{ position: 'relative' }}>
      <StyledMeetingList>
        {meetings.map((meeting, index) => (
          <StyledMeeting key={meeting.id} onClick={() => openModal(index)}>
            <Meeting meeting={meeting.data} />
          </StyledMeeting>
        ))}
        {/* <StyledMeeting></StyledMeeting>
        <StyledMeeting onClick={(index) => openModal(index)}></StyledMeeting>
        <StyledMeeting></StyledMeeting> */}
        <StyledAddNewButton onClick={openModal}>+</StyledAddNewButton>
      </StyledMeetingList>

      <MeetingForm currentId={activeMeeting?.id} open={activeModal} />
    </div>
  );
};
