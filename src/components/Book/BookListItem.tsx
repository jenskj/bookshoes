import React, { useEffect, useState } from 'react';
import { FirestoreBook } from '../../pages/Books/Books';
import {
  StyledBookAuthor,
  StyledBookCard,
  StyledBookCover,
  StyledBookTitle,
} from './styles';
import { BookStatusIcon } from './BookStatusIcon';

type BookProps = {
  book: FirestoreBook;
  showDetails?: boolean;
  onClick?: () => void;
};

export const BookListItem = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  showDetails = true,
  onClick,
}: BookProps) => {
  const [bookCoverLink, setBookCoverLink] = useState<string>('');

  useEffect(() => {
    const imageUrl = `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w176-h264&source=gbs_api`;
    setBookCoverLink(imageUrl);
  }, [id]);

  return (
    <StyledBookCard onClick={onClick}>
      <StyledBookCover src={bookCoverLink || ''} alt={volumeInfo?.title} />

      {showDetails && (
        <>
          <StyledBookTitle title={volumeInfo?.title}>
            {volumeInfo?.title}
          </StyledBookTitle>
          <StyledBookAuthor
            title={
              volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
            }
          >
            {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
          </StyledBookAuthor>
          <BookStatusIcon readStatus={readStatus}></BookStatusIcon>
        </>
      )}
    </StyledBookCard>
  );
};
