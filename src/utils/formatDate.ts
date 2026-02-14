import { format } from 'date-fns';
import { da } from 'date-fns/locale';

export const formatDate = (ts: string | Date, time: boolean = false): string => {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return format(date, `dd-MM-yyyy${time ? " 'at' HH:mm" : ''}`, {
    locale: da,
  });
};
