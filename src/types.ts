import { DocumentReference, Timestamp } from 'firebase/firestore';
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

// Meeting types
export interface MeetingInfo {
  date?: Timestamp;
  location?: string;
}

export interface FirestoreMeeting {
  docId: string;
  data: MeetingInfo;
}

// User types
export interface UserInfo {
  id: string;
  photoURL: string;
  activeClub?: DocumentReference;
  memberships?: string[];
}

export interface FirestoreUser {
  docId: string;
  data: UserInfo;
}

export type UserRole = 'standard' | 'admin' | 'moderator';

// Club types
export interface FirestoreClub {
  docId: string;
  data: ClubInfo;
}

export interface ClubInfo {
  name: string;
  isPrivate: boolean;
  tagline?: string;
  description?: string;
  members?: FirestoreMember[];
}

// Member types
export interface FirestoreMember {
  docId: string;
  data: MemberInfo;
}

export interface MemberInfo extends UserInfo {
  user: FirestoreUser;
}

// Swiper
export interface PageSlide {
  title: string;
  description?: string;
}