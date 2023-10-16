import { Timestamp } from 'firebase/firestore';
import { GoogleBook } from './utils/getBooks';

// Book types
export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

export interface FirestoreBook {
  docId?: string;
  data: BookInfo;
}

export interface BookInfo extends GoogleBook {
  readStatus?: ReadStatus;
  addedDate?: string;
  googleId?: string;
  scheduledMeeting?: string;
}

export interface MeetingInfo {
  date?: Timestamp;
  location?: string;
}

export interface FirestoreMeeting {
  docId: string;
  data: MeetingInfo;
}
