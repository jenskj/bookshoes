import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBookStore } from '../../hooks';
import { FirestoreBook } from '../../types';

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
    <div>
      {book && (
        <>
          <h1>{book.data.volumeInfo?.title}</h1>
          <p>{book.data.volumeInfo?.authors.join(', ')}</p>
          <p>{book.data.volumeInfo?.description}</p>
        </>
      )}
    </div>
  );
};
