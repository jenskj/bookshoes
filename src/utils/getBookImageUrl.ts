import type { BookInfo } from '@types';

export interface ImageSize {
  w: string;
  h: string;
}

const getPlaceholderImageUrl = (): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}book-placeholder.svg`;
};

function getGoogleCoverUrl(id: string, size?: ImageSize): string {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?zoom=0&fife=w${
    size ? size.w : '188'
  }-h${size ? size.h : '260'}&source=gbs_api`;
}

export const getBookImageUrl = (
  bookOrId: BookInfo | string,
  size?: ImageSize
): string => {
  if (typeof bookOrId === 'string') {
    return getGoogleCoverUrl(bookOrId, size);
  }

  const directCover =
    bookOrId.coverUrl ??
    bookOrId.volumeInfo?.imageLinks?.thumbnail;
  if (directCover) {
    return directCover;
  }

  if (bookOrId.source === 'google') {
    const googleId = bookOrId.sourceBookId ?? bookOrId.googleId ?? bookOrId.id;
    if (googleId) {
      return getGoogleCoverUrl(googleId, size);
    }
  }

  return getPlaceholderImageUrl();
};

export { getPlaceholderImageUrl };
