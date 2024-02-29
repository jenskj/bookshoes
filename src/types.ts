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
  progressReports?: BookProgressLog[];
  ratings?: BookRating[];
}

export interface BookRating {
  memberId: string;
  rating: number;
  dateAdded: Timestamp;
  dateModified?: Timestamp;
}

export interface BookProgressLog {
  user: UserInfo;
  currentPage: number;
}

// Meeting types
export interface MeetingInfo {
  date?: Timestamp;
  location?: MeetingLocation;
  comments?: MeetingComment[];
}

export interface MeetingLocation {
  user?: UserInfo;
  remoteInfo?: MeetingRemoteInfo;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface MeetingRemoteInfo {
  link?: string;
  password?: string;
}


export interface MeetingComment {
  user: UserInfo;
  title?: string;
  text: string;
  dateAdded: Timestamp;
  dateModified?: Timestamp;
  taggedUsers?: string[];
  taggedBooks?: string[];
  type?: 'reminder' | 'comment' | 'poll' | 'announcement' | 'suggestion';
}

export interface FirestoreMeeting {
  docId: string;
  data: MeetingInfo;
}

// User types
export interface UserInfo {
  uid: string;
  photoURL: string;
  displayName: string;
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
  members?: FirestoreMember[] | null;
}

// Member types
export interface FirestoreMember {
  docId: string;
  data: MemberInfo;
}

export interface MemberInfo extends UserInfo {
  role: UserRole;
}

// Swiper
export interface PageSlide {
  title: string;
  description?: string;
}
