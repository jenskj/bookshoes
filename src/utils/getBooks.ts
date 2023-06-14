import axios from 'axios';
const API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API;

export interface GoogleBook {
  id: string;
  volumeInfo?: {
    title: string;
    authors: string[];
    imageLinks: {
      thumbnail: string;
    };
    description: string;
  };
}

export const getBooksBySearch = async (searchTerm: string) => {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${API_KEY}`;
    const response = await axios.get<{ items: GoogleBook[] }>(url);
    const mappedBooks = response.data.items.map((item) => ({
      data: item,
    }));
    return mappedBooks;
  } catch (error) {
    console.error(error);
  }
};

