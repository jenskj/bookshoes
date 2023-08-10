import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookInfo, MeetingInfo } from '..';
import { BookListItem, MeetingForm } from '../../components';
import { db } from '../../firestore';
import { StyledBooksBanner } from './styles';

export const MeetingDetails = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  //   const [books, setBooks] = useState<BookInfo[]>();

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'meetings', id);
      getDoc(docRef).then((res) => {
        setMeeting({ ...res.data() });
      });
    }
  }, [id]);

  const openModal = (e: React.MouseEvent<HTMLDivElement>, book: BookInfo) => {
    setActiveModal(true);
  };

  return (
    <div>
      <div>Edit</div>
      <StyledBooksBanner>
        {meeting?.books?.map(
          (book) =>
            book?.data?.volumeInfo && (
              <div onClick={(e) => openModal(e, book.data)}>
                <BookListItem key={book.id} book={book} />
              </div>
            )
        )}
      </StyledBooksBanner>

      <MeetingForm open={activeModal} currentId={id} />
    </div>
  );
};
