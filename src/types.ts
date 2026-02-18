import { GoogleBook } from './utils/getBooks';

// Book types
export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

export interface Book {
  docId?: string;
  data: BookInfo;
}

/** @deprecated Use Book */
export type FirestoreBook = Book;

export interface BookInfo extends GoogleBook {
  readStatus?: ReadStatus;
  addedDate?: string; // ISO date string
  inactive?: boolean;
  googleId?: string;
  scheduledMeetings?: string[];
  progressReports?: BookProgressLog[];
  ratings?: BookRating[];
}

export interface BookRating {
  memberId: string;
  rating: number;
  dateAdded: string;
  dateModified?: string;
}

export interface BookProgressLog {
  user: UserInfo;
  currentPage: number;
}

// Meeting types
export interface MeetingInfo {
  date?: string; // ISO date string
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
  dateAdded: string;
  dateModified?: string;
  citation?: {
    page?: number;
    chapter?: string;
  };
  spoiler?: {
    enabled: boolean;
    revealAfterPage?: number;
  };
  taggedUsers?: string[];
  taggedBooks?: string[];
  type?: 'reminder' | 'comment' | 'poll' | 'announcement' | 'suggestion';
}

export interface Meeting {
  docId: string;
  data: MeetingInfo;
}

/** @deprecated Use Meeting */
export type FirestoreMeeting = Meeting;

// User types
export interface UserInfo {
  uid: string;
  email?: string;
  photoURL: string;
  displayName: string;
  activeClub?: string; // club ID (was DocumentReference)
  memberships?: string[];
}

export interface User {
  docId: string;
  data: UserInfo;
}

/** @deprecated Use User */
export type FirestoreUser = User;

export type UserRole = 'standard' | 'admin' | 'moderator';

// Club types
export interface Club {
  docId: string;
  data: ClubInfo;
}

/** @deprecated Use Club */
export type FirestoreClub = Club;

export interface ClubInfo {
  name: string;
  isPrivate: boolean;
  tagline?: string;
  description?: string;
  members?: Member[] | null;
}

// Member types
export interface Member {
  docId: string;
  data: MemberInfo;
}

/** @deprecated Use Member */
export type FirestoreMember = Member;

export interface MemberInfo extends UserInfo {
  role: UserRole;
}

// Swiper
export interface PageSlide {
  title: string;
  description?: string;
}
