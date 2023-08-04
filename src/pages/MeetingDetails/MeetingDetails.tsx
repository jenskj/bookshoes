import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firestore';
import { BookInfo, MeetingInfo } from '..';
import { StyledBooksBanner } from './styles';
import { BookListItem, MeetingForm } from '../../components';

export const MeetingDetails = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  //   const [books, setBooks] = useState<BookInfo[]>();

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'meetings', id);
      getDoc(docRef).then((res) => {
        console.log(res);
        setMeeting({ ...res.data() });
      });
    }
  }, []);

  const openModal = (e: React.MouseEvent<HTMLDivElement>, book: BookInfo) => {
    console.log(book);
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

      <MeetingForm activeModal={activeModal} currentId={id} />
    </div>
  );
};
