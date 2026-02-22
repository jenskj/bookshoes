// Book types
export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';
export type BookSource = 'google' | 'open_library' | 'manual';

export interface IndustryIdentifier {
  type: string;
  identifier: string;
}

export interface VolumeInfo {
  title: string;
  authors: string[];
  imageLinks?: {
    thumbnail?: string;
  };
  description?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  publishedDate?: string;
  publisher?: string;
  industryIdentifiers?: IndustryIdentifier[];
}

export interface CatalogBookCandidate {
  providerResultId: string;
  source: BookSource;
  sourceBookId: string;
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  publishedDate?: string;
  publisher?: string;
  coverUrl?: string;
  isbn10?: string;
  isbn13?: string;
  metadataRaw?: Record<string, unknown>;
}

export interface CustomBookInput {
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  coverUrl?: string;
  isbn10?: string;
  isbn13?: string;
}

export interface Book {
  docId?: string;
  data: BookInfo;
}

/** @deprecated Use Book */
export type FirestoreBook = Book;

export interface BookInfo {
  id: string;
  volumeInfo?: VolumeInfo;
  source?: BookSource;
  sourceBookId?: string | null;
  coverUrl?: string;
  isbn10?: string;
  isbn13?: string;
  metadataRaw?: Record<string, unknown>;
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
  type?: MeetingCommentType;
}

export type MeetingCommentType =
  | 'reminder'
  | 'comment'
  | 'poll'
  | 'announcement'
  | 'suggestion';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeAccentPreset = 'classic' | 'forest' | 'rose';
export type DateLocale = 'system' | 'en-US' | 'en-GB' | 'da-DK';
export type TimeFormat = 'system' | '12h' | '24h';
export type DefaultLandingTab = 'home' | 'meetings' | 'books' | 'clubs';

export interface UserSettings {
  theme: {
    mode: ThemeMode;
    accentPreset: ThemeAccentPreset;
  };
  dateTime: {
    locale: DateLocale;
    timeFormat: TimeFormat;
  };
  navigation: {
    defaultLandingTab: DefaultLandingTab;
  };
  privacy: {
    shareOnlinePresence: boolean;
    shareReadingProgress: boolean;
  };
  comments: {
    defaultSpoilerEnabled: boolean;
    defaultNoteType: MeetingCommentType;
  };
  automation: {
    autoMarkReadWhenMeetingsPassed: boolean;
    autoMarkReadMinimumScheduledMeetings: number;
  };
  clubContext: {
    autoSelectLastActiveClub: boolean;
    defaultCollapsed: boolean;
  };
  notifications: {
    meetingReminders: boolean;
    mentions: boolean;
    clubAnnouncements: boolean;
    emailDigest: boolean;
  };
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
export type ClubJoinRequestStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'cancelled';
export type ClubJoinRequestDecision = 'approved' | 'denied';
export type ClubPreset = 'general' | 'classics' | 'non_fiction' | 'genre';
export type ClubJoinMode =
  | 'public_direct'
  | 'invite_only'
  | 'invite_or_request';
export type ClubCadence = 'weekly' | 'biweekly' | 'monthly';

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
  settings?: ClubSettings;
}

export interface ClubSettings {
  setup: {
    preset: ClubPreset;
  };
  access: {
    joinMode: ClubJoinMode;
    autoPromoteFirstMembersToModerator: number;
  };
  meetings: {
    cadence: ClubCadence;
    preferredWeekday: number;
    preferredTime: string; // HH:mm
    timezone: string;
  };
  readingWorkflow: {
    votingWindowDays: number;
    autoPromoteWinner: boolean;
    autoMarkReadMinimumScheduledMeetings: number;
  };
  invites: {
    defaultExpiryDays: number;
    defaultMaxUses: number | null;
  };
  discussion: {
    spoilerPolicy: 'off' | 'after_citation_page' | 'custom_page';
    spoilerRevealAfterPage: number | null;
    defaultNoteType: MeetingCommentType;
  };
  onboarding: {
    message: string;
    rules: string;
  };
  branding: {
    accentPreset: ThemeAccentPreset;
    emoji: string;
    coverUrl: string;
  };
}

export interface ClubInvite {
  docId: string;
  data: {
    clubId: string;
    inviteCode: string;
    createdBy: string;
    maxUses?: number | null;
    usesCount: number;
    expiresAt?: string | null;
    revokedAt?: string | null;
    createdAt: string;
  };
}

export interface ClubJoinRequest {
  docId: string;
  data: {
    clubId: string;
    requesterUserId: string;
    message?: string | null;
    status: ClubJoinRequestStatus;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    requester?: Pick<UserInfo, 'uid' | 'displayName' | 'photoURL'>;
  };
}

export interface ClubMemberAction {
  memberId: string;
  type: 'role-change' | 'remove' | 'leave';
  targetRole?: UserRole;
}

export interface ClubPermissionSnapshot {
  isMember: boolean;
  role?: UserRole;
  canEditClubProfile: boolean;
  canCreateInvites: boolean;
  canReviewJoinRequests: boolean;
  canManageRoles: boolean;
  canRemoveMembers: boolean;
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
