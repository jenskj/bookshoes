import type {
  DateLocale,
  DefaultLandingTab,
  MeetingCommentType,
  ThemeAccentPreset,
  ThemeMode,
  TimeFormat,
  UserSettings,
} from '@types';

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];
const THEME_ACCENTS: ThemeAccentPreset[] = ['classic', 'forest', 'rose'];
const DATE_LOCALES: DateLocale[] = ['system', 'en-US', 'en-GB', 'da-DK'];
const TIME_FORMATS: TimeFormat[] = ['system', '12h', '24h'];
const LANDING_TABS: DefaultLandingTab[] = ['home', 'meetings', 'books', 'clubs'];
const COMMENT_TYPES: MeetingCommentType[] = [
  'reminder',
  'comment',
  'poll',
  'announcement',
  'suggestion',
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: {
    mode: 'system',
    accentPreset: 'classic',
  },
  dateTime: {
    locale: 'system',
    timeFormat: 'system',
  },
  navigation: {
    defaultLandingTab: 'home',
  },
  privacy: {
    shareOnlinePresence: true,
    shareReadingProgress: true,
  },
  comments: {
    defaultSpoilerEnabled: false,
    defaultNoteType: 'comment',
  },
  automation: {
    autoMarkReadWhenMeetingsPassed: true,
    autoMarkReadMinimumScheduledMeetings: 1,
  },
  clubContext: {
    autoSelectLastActiveClub: true,
    defaultCollapsed: true,
  },
  notifications: {
    meetingReminders: true,
    mentions: true,
    clubAnnouncements: true,
    emailDigest: false,
  },
};

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const pickEnum = <T extends string>(value: unknown, allowed: T[], fallback: T): T => {
  if (typeof value !== 'string') return fallback;
  return allowed.includes(value as T) ? (value as T) : fallback;
};

const pickBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const pickIntegerInRange = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  const rounded = Math.round(value);
  return Math.min(max, Math.max(min, rounded));
};

export const sanitizeUserSettings = (value: unknown): UserSettings => {
  const root = asRecord(value);
  const theme = asRecord(root.theme);
  const dateTime = asRecord(root.dateTime);
  const navigation = asRecord(root.navigation);
  const privacy = asRecord(root.privacy);
  const comments = asRecord(root.comments);
  const automation = asRecord(root.automation);
  const clubContext = asRecord(root.clubContext);
  const notifications = asRecord(root.notifications);

  return {
    theme: {
      mode: pickEnum(theme.mode, THEME_MODES, DEFAULT_USER_SETTINGS.theme.mode),
      accentPreset: pickEnum(
        theme.accentPreset,
        THEME_ACCENTS,
        DEFAULT_USER_SETTINGS.theme.accentPreset
      ),
    },
    dateTime: {
      locale: pickEnum(
        dateTime.locale,
        DATE_LOCALES,
        DEFAULT_USER_SETTINGS.dateTime.locale
      ),
      timeFormat: pickEnum(
        dateTime.timeFormat,
        TIME_FORMATS,
        DEFAULT_USER_SETTINGS.dateTime.timeFormat
      ),
    },
    navigation: {
      defaultLandingTab: pickEnum(
        navigation.defaultLandingTab,
        LANDING_TABS,
        DEFAULT_USER_SETTINGS.navigation.defaultLandingTab
      ),
    },
    privacy: {
      shareOnlinePresence: pickBoolean(
        privacy.shareOnlinePresence,
        DEFAULT_USER_SETTINGS.privacy.shareOnlinePresence
      ),
      shareReadingProgress: pickBoolean(
        privacy.shareReadingProgress,
        DEFAULT_USER_SETTINGS.privacy.shareReadingProgress
      ),
    },
    comments: {
      defaultSpoilerEnabled: pickBoolean(
        comments.defaultSpoilerEnabled,
        DEFAULT_USER_SETTINGS.comments.defaultSpoilerEnabled
      ),
      defaultNoteType: pickEnum(
        comments.defaultNoteType,
        COMMENT_TYPES,
        DEFAULT_USER_SETTINGS.comments.defaultNoteType
      ),
    },
    automation: {
      autoMarkReadWhenMeetingsPassed: pickBoolean(
        automation.autoMarkReadWhenMeetingsPassed,
        DEFAULT_USER_SETTINGS.automation.autoMarkReadWhenMeetingsPassed
      ),
      autoMarkReadMinimumScheduledMeetings: pickIntegerInRange(
        automation.autoMarkReadMinimumScheduledMeetings,
        DEFAULT_USER_SETTINGS.automation.autoMarkReadMinimumScheduledMeetings,
        1,
        10
      ),
    },
    clubContext: {
      autoSelectLastActiveClub: pickBoolean(
        clubContext.autoSelectLastActiveClub,
        DEFAULT_USER_SETTINGS.clubContext.autoSelectLastActiveClub
      ),
      defaultCollapsed: pickBoolean(
        clubContext.defaultCollapsed,
        DEFAULT_USER_SETTINGS.clubContext.defaultCollapsed
      ),
    },
    notifications: {
      meetingReminders: pickBoolean(
        notifications.meetingReminders,
        DEFAULT_USER_SETTINGS.notifications.meetingReminders
      ),
      mentions: pickBoolean(
        notifications.mentions,
        DEFAULT_USER_SETTINGS.notifications.mentions
      ),
      clubAnnouncements: pickBoolean(
        notifications.clubAnnouncements,
        DEFAULT_USER_SETTINGS.notifications.clubAnnouncements
      ),
      emailDigest: pickBoolean(
        notifications.emailDigest,
        DEFAULT_USER_SETTINGS.notifications.emailDigest
      ),
    },
  };
};

export const getUserLocale = (locale: DateLocale): string => {
  if (locale !== 'system') return locale;
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
};
