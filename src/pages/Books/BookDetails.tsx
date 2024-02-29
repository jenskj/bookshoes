import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBookStore } from '@hooks';
import { FirestoreBook } from '@types';
import { StyledPageTitle } from '@pages/styles';

export const BookDetails = () => {
  const { id } = useParams();
  const { books } = useBookStore();
  const [book, setBook] = useState<FirestoreBook>();

  useEffect(() => {
    if (id && books) {
      const currentBook = books.find((book) => book.docId === id);
      if (currentBook) {
        setBook(currentBook);
      }
    }
  }, [id, books]);

  return (
    <>
      <StyledPageTitle>{book?.data.volumeInfo?.title}</StyledPageTitle>
      {book && (
        <>
          <p>{book.data.volumeInfo?.authors.join(', ')}</p>
          <p>{book.data.volumeInfo?.description}</p>
        </>
      )}
    </>
  );
};
