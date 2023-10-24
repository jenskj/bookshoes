export interface ImageSize {
  w: string;
  h: string;
}

export const getBookImageUrl = (id: string, size?: ImageSize): string => {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?zoom=0&fife=w${
    size ? size.w : '188'
  }-h${size ? size.h : '260'}&source=gbs_api`;
};
