import { GoogleBook } from './utils/getBooks';

// Book types
export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

export interface FirestoreBook {
  docId?: string;
  data: BookInfo;
}

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
  activeClub?: string; // club ID (was DocumentReference)
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
