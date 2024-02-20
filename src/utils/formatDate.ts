import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export const formatDate = (ts: Timestamp, time: boolean = false): string => {
  return format(ts.toDate(), `dd-MM-yyyy${time ? ' HH:mm' : ''}`, {
    locale: da,
  });
};
