import { useEffect, useState } from 'react';
import { FirestoreBook, ReadStatus } from '../../pages/Books/Books';
import {
  StyledModalBookForm,
  StyledBookStatus,
  StyledStatusSelect,
} from '../../pages/Books/styles';
import {
  StyledBookAuthor,
  StyledBookBanner,
  StyledBookDescription,
  StyledBookDescriptionContainer,
  StyledBookDetailsHeader,
  StyledBookTitle,
} from './styles';

type BookProps = {
  book: FirestoreBook;
  updateBookStatus: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const BookDetails = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  updateBookStatus,
}: BookProps) => {
  const [currentStatus, setCurrentStatus] = useState<ReadStatus>();

  useEffect(() => {
    setCurrentStatus(readStatus);
  }, [readStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const selectedStatus = e.target.value as ReadStatus;
    // Sets current status in order to avoid delay when waiting for status from Firestore
    setCurrentStatus(selectedStatus);
    updateBookStatus(e);
  };

  return (
    <>
      <StyledBookBanner>
        <img src={volumeInfo?.imageLinks?.thumbnail} alt={volumeInfo?.title} />
      </StyledBookBanner>
      <StyledBookDetailsHeader>
        <StyledBookTitle title={volumeInfo?.title}>
          {volumeInfo?.title}
        </StyledBookTitle>
        <StyledBookAuthor
          title={
            volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
          }
        >
          by {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
        </StyledBookAuthor>
      </StyledBookDetailsHeader>

      {/* Select status form */}
      <StyledModalBookForm>
        <StyledBookStatus>
          Status:
          <StyledStatusSelect
            value={currentStatus || 'Unread'}
            // Hvordan kan det være, at det her virker instantant?
            // value={
            //   books.find((item) => item.data.id === id)?.data
            //     .readStatus || 'Unread'
            // }
            onChange={handleStatusChange}
          >
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="reading">Currently reading</option>
            <option value="candidate">Reading candidate</option>
          </StyledStatusSelect>
        </StyledBookStatus>
      </StyledModalBookForm>

      {volumeInfo?.description && (
        <StyledBookDescriptionContainer>
          <b>Description</b>
          <StyledBookDescription>
            {volumeInfo?.description}
          </StyledBookDescription>
        </StyledBookDescriptionContainer>
      )}
    </>
  );
};
