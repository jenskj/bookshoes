import { Book, ReadStatus } from '@types';

export type LaneKey = 'unread' | 'candidate' | 'read';

export interface LaneConfig {
  key: LaneKey;
  title: string;
}

export const LANE_CONFIG: LaneConfig[] = [
  { key: 'unread', title: 'To Read' },
  { key: 'candidate', title: 'Voting' },
  { key: 'read', title: 'Read' },
];

export const mapLaneToReadStatus = (lane: LaneKey): ReadStatus => {
  return lane === 'candidate' ? 'candidate' : lane;
};

export const getLaneBooks = (books: Book[], lane: LaneKey) => {
  if (lane === 'candidate') {
    return books.filter(
      (book) =>
        !book.data.inactive &&
        (book.data.readStatus === 'candidate' || book.data.readStatus === 'reading')
    );
  }
  return books.filter(
    (book) => !book.data.inactive && (book.data.readStatus || 'unread') === lane
  );
};
