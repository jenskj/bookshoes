import type {
  ClubCadence,
  ClubJoinMode,
  ClubPreset,
  ClubSettings,
  MeetingCommentType,
  ThemeAccentPreset,
} from '@types';

const CLUB_PRESETS: ClubPreset[] = ['general', 'classics', 'non_fiction', 'genre'];
const JOIN_MODES: ClubJoinMode[] = [
  'public_direct',
  'invite_only',
  'invite_or_request',
];
const CADENCE_VALUES: ClubCadence[] = ['weekly', 'biweekly', 'monthly'];
const ACCENT_PRESETS: ThemeAccentPreset[] = ['classic', 'forest', 'rose'];
const NOTE_TYPES: MeetingCommentType[] = [
  'comment',
  'suggestion',
  'announcement',
  'poll',
  'reminder',
];

export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  setup: {
    preset: 'general',
  },
  access: {
    joinMode: 'public_direct',
    autoPromoteFirstMembersToModerator: 0,
  },
  meetings: {
    cadence: 'monthly',
    preferredWeekday: 3,
    preferredTime: '19:00',
    timezone: 'system',
  },
  readingWorkflow: {
    votingWindowDays: 7,
    autoPromoteWinner: false,
    autoMarkReadMinimumScheduledMeetings: 1,
  },
  invites: {
    defaultExpiryDays: 7,
    defaultMaxUses: null,
  },
  discussion: {
    spoilerPolicy: 'after_citation_page',
    spoilerRevealAfterPage: null,
    defaultNoteType: 'comment',
  },
  onboarding: {
    message: '',
    rules: '',
  },
  branding: {
    accentPreset: 'classic',
    emoji: '',
    coverUrl: '',
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

const pickString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' ? value : fallback;
};

const pickIntegerInRange = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  const rounded = Math.round(value);
  return Math.max(min, Math.min(max, rounded));
};

const pickWeekday = (value: unknown, fallback: number): number => {
  return pickIntegerInRange(value, fallback, 0, 6);
};

const pickTime = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
  return match ? value.trim() : fallback;
};

const pickOptionalPositiveInteger = (
  value: unknown,
  fallback: number | null,
  max: number
): number | null => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < 1) return fallback;
  return Math.min(rounded, max);
};

export const sanitizeClubSettings = (value: unknown): ClubSettings => {
  const root = asRecord(value);
  const setup = asRecord(root.setup);
  const access = asRecord(root.access);
  const meetings = asRecord(root.meetings);
  const workflow = asRecord(root.readingWorkflow);
  const invites = asRecord(root.invites);
  const discussion = asRecord(root.discussion);
  const onboarding = asRecord(root.onboarding);
  const branding = asRecord(root.branding);

  return {
    setup: {
      preset: pickEnum(
        setup.preset,
        CLUB_PRESETS,
        DEFAULT_CLUB_SETTINGS.setup.preset
      ),
    },
    access: {
      joinMode: pickEnum(
        access.joinMode,
        JOIN_MODES,
        DEFAULT_CLUB_SETTINGS.access.joinMode
      ),
      autoPromoteFirstMembersToModerator: pickIntegerInRange(
        access.autoPromoteFirstMembersToModerator,
        DEFAULT_CLUB_SETTINGS.access.autoPromoteFirstMembersToModerator,
        0,
        50
      ),
    },
    meetings: {
      cadence: pickEnum(
        meetings.cadence,
        CADENCE_VALUES,
        DEFAULT_CLUB_SETTINGS.meetings.cadence
      ),
      preferredWeekday: pickWeekday(
        meetings.preferredWeekday,
        DEFAULT_CLUB_SETTINGS.meetings.preferredWeekday
      ),
      preferredTime: pickTime(
        meetings.preferredTime,
        DEFAULT_CLUB_SETTINGS.meetings.preferredTime
      ),
      timezone: pickString(
        meetings.timezone,
        DEFAULT_CLUB_SETTINGS.meetings.timezone
      ),
    },
    readingWorkflow: {
      votingWindowDays: pickIntegerInRange(
        workflow.votingWindowDays,
        DEFAULT_CLUB_SETTINGS.readingWorkflow.votingWindowDays,
        1,
        30
      ),
      autoPromoteWinner:
        typeof workflow.autoPromoteWinner === 'boolean'
          ? workflow.autoPromoteWinner
          : DEFAULT_CLUB_SETTINGS.readingWorkflow.autoPromoteWinner,
      autoMarkReadMinimumScheduledMeetings: pickIntegerInRange(
        workflow.autoMarkReadMinimumScheduledMeetings,
        DEFAULT_CLUB_SETTINGS.readingWorkflow.autoMarkReadMinimumScheduledMeetings,
        1,
        10
      ),
    },
    invites: {
      defaultExpiryDays: pickIntegerInRange(
        invites.defaultExpiryDays,
        DEFAULT_CLUB_SETTINGS.invites.defaultExpiryDays,
        1,
        60
      ),
      defaultMaxUses: pickOptionalPositiveInteger(
        invites.defaultMaxUses,
        DEFAULT_CLUB_SETTINGS.invites.defaultMaxUses,
        1000
      ),
    },
    discussion: {
      spoilerPolicy: pickEnum(
        discussion.spoilerPolicy,
        ['off', 'after_citation_page', 'custom_page'],
        DEFAULT_CLUB_SETTINGS.discussion.spoilerPolicy
      ),
      spoilerRevealAfterPage: pickOptionalPositiveInteger(
        discussion.spoilerRevealAfterPage,
        DEFAULT_CLUB_SETTINGS.discussion.spoilerRevealAfterPage,
        5000
      ),
      defaultNoteType: pickEnum(
        discussion.defaultNoteType,
        NOTE_TYPES,
        DEFAULT_CLUB_SETTINGS.discussion.defaultNoteType
      ),
    },
    onboarding: {
      message: pickString(onboarding.message, DEFAULT_CLUB_SETTINGS.onboarding.message),
      rules: pickString(onboarding.rules, DEFAULT_CLUB_SETTINGS.onboarding.rules),
    },
    branding: {
      accentPreset: pickEnum(
        branding.accentPreset,
        ACCENT_PRESETS,
        DEFAULT_CLUB_SETTINGS.branding.accentPreset
      ),
      emoji: pickString(branding.emoji, DEFAULT_CLUB_SETTINGS.branding.emoji),
      coverUrl: pickString(branding.coverUrl, DEFAULT_CLUB_SETTINGS.branding.coverUrl),
    },
  };
};

export const getEffectiveClubJoinMode = (
  isPrivate: boolean,
  joinMode?: ClubJoinMode | null
): ClubJoinMode => {
  if (!isPrivate) {
    return 'public_direct';
  }
  if (joinMode === 'invite_only' || joinMode === 'invite_or_request') {
    return joinMode;
  }
  return 'invite_or_request';
};

export const normalizeCreateClubAccessMode = (
  isPrivate: boolean,
  joinMode: ClubJoinMode
): ClubJoinMode => {
  return getEffectiveClubJoinMode(isPrivate, joinMode);
};

export const getClubJoinModeLabel = (joinMode: ClubJoinMode): string => {
  if (joinMode === 'invite_only') return 'Invite only';
  if (joinMode === 'invite_or_request') return 'Invite + request';
  return 'Public direct join';
};
