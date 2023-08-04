import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FirestoreBook } from '..';
import { Meeting, MeetingForm } from '../../components';
import { firestore } from '../../firestore';
import { StyledAddNewButton, StyledMeeting, StyledMeetingList } from './styles';
import { Link } from 'react-router-dom';

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

  const openModal = (index: number) => {
    if (index !== null) {
      console.log(index);
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <StyledMeetingList>
        {meetings.map((meeting, index) => (
          <Link to={`/meetings/${meeting.id}`}>
            <StyledMeeting key={meeting.id}>
              <div onClick={() => openModal(index)}>Edit</div>
              <Meeting meeting={meeting.data} />
            </StyledMeeting>
          </Link>
        ))}
        {/* <StyledMeeting></StyledMeeting>
        <StyledMeeting onClick={(index) => openModal(index)}></StyledMeeting>
        <StyledMeeting></StyledMeeting> */}
        <StyledAddNewButton onClick={openModal}>+</StyledAddNewButton>
      </StyledMeetingList>

      <MeetingForm activeModal={activeModal} currentId={activeMeeting?.id} />
    </div>
  );
};
