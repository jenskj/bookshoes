import { format } from 'date-fns';
import { da } from 'date-fns/locale';

export type DateInput = string | Date | { seconds?: number } | undefined;

export const parseDate = (ts: DateInput): Date | null => {
  if (!ts) return null;
  if (typeof ts === 'string') return new Date(ts);
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && 'seconds' in ts) return new Date(ts.seconds! * 1000);
  return null;
};

export const formatDate = (ts: DateInput, time: boolean = false): string => {
  const date = parseDate(ts);
  if (!date) return '';
  return format(date, `dd-MM-yyyy${time ? " 'at' HH:mm" : ''}`, {
    locale: da,
  });
};
