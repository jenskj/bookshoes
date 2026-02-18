import { DEFAULT_USER_SETTINGS, getUserLocale } from '@lib/userSettings';
import type { UserSettings } from '@types';

export type DateInput = string | Date | { seconds?: number } | undefined;

export const parseDate = (ts: DateInput): Date | null => {
  if (!ts) return null;
  if (typeof ts === 'string') {
    const parsed = new Date(ts);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (ts instanceof Date) {
    return Number.isNaN(ts.getTime()) ? null : ts;
  }
  if (typeof ts === 'object' && 'seconds' in ts) return new Date(ts.seconds! * 1000);
  return null;
};

export const formatDate = (
  ts: DateInput,
  time: boolean = false,
  dateTimeSettings?: UserSettings['dateTime']
): string => {
  const date = parseDate(ts);
  if (!date) return '';
  const resolvedSettings = dateTimeSettings ?? DEFAULT_USER_SETTINGS.dateTime;
  const locale = getUserLocale(resolvedSettings.locale);
  const hour12 =
    resolvedSettings.timeFormat === '12h'
      ? true
      : resolvedSettings.timeFormat === '24h'
        ? false
        : undefined;
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(time
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12,
        }
      : {}),
  });
  return formatter.format(date);
};
