export const getBookImageUrl = (
  id: string,
  size?: { w: string; h: string }
): string => {
  return `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w${
    size ? size.w : '130'}-h${
    size ? size.h : '260'}&zoom=0&source=gbs_api`;
};
