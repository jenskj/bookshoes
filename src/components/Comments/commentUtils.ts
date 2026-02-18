import { MeetingComment } from '@types';

export const getRevealAfterPage = (comment: MeetingComment) => {
  return comment.spoiler?.revealAfterPage || comment.citation?.page || 0;
};

export const shouldHideSpoiler = (
  comment: MeetingComment,
  viewerPage: number
) => {
  if (!comment.spoiler?.enabled) return false;
  const revealAfterPage = getRevealAfterPage(comment);
  if (revealAfterPage <= 0) return false;
  return viewerPage < revealAfterPage;
};
