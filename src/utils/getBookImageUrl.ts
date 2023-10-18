export interface ImageSize {
  w: string;
  h: string;
}

export const getBookImageUrl = (
  id: string,
  size?: ImageSize
): string => {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w${
    size ? size.w : '188'}&source=gbs_api`;
};
