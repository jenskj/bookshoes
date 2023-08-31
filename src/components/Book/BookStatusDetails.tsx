import React, { useEffect, useRef, useState } from 'react';
import { FirestoreBook } from '../../pages';
import { BookListItem } from './BookListItem';
import {
  StyledBookStatusCard,
  StyledBookStatusDetails,
  StyledCardHeader,
  StyledInfoTable,
  StyledTableData,
  StyledTableHeader,
} from './styles';

interface BookStatusDetailsProps {
  book: FirestoreBook;
}

export const BookStatusDetails = ({ book }: BookStatusDetailsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current.offsetWidth);
    }
  }, [ref.current]);
  return (
    <StyledBookStatusDetails ref={ref}>
      <BookListItem book={book} showDetails={false} />
      <StyledBookStatusCard>
        <StyledCardHeader>Book info</StyledCardHeader>
        <hr />
        <StyledInfoTable>
          {/* Title */}
          <tr>
            <StyledTableHeader>Title: </StyledTableHeader>
            <StyledTableData containerWidth={containerWidth}>
              {book.data.volumeInfo?.title}
            </StyledTableData>
          </tr>
          {/* Author(s) */}
          <tr>
            <StyledTableHeader>
              {book?.data?.volumeInfo?.authors?.length &&
              book?.data?.volumeInfo?.authors?.length > 1
                ? 'Authors'
                : 'Author'}
              :{' '}
            </StyledTableHeader>
            <StyledTableData containerWidth={containerWidth}>
              {book.data.volumeInfo?.authors.join(',')}
            </StyledTableData>
          </tr>
        </StyledInfoTable>
      </StyledBookStatusCard>
    </StyledBookStatusDetails>
  );
};
