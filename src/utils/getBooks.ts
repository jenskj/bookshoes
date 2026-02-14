import axios from 'axios';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API ?? "";

export interface GoogleBook {
  id: string;
  volumeInfo?: VolumeInfo;
}

export interface VolumeInfo {
  title: string;
  authors: string[];
  imageLinks: {
    thumbnail: string;
  };
  description?: string;
  pageCount: number;
  averageRating?: number;
  ratingsCount?: number;
  publishedDate?: string;
  publisher?: string;
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

export const getBookById: (
  id: string
) => Promise<GoogleBook | undefined> = async (id: string) => {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes/${id}`;
    const response = await axios.get<{ volumeInfo: VolumeInfo }>(url);
    const newBook = {
      id,
      volumeInfo: response.data.volumeInfo,
    };
    return newBook;
  } catch (error) {
    console.error(error);
  }
};
