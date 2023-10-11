import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export const formatDate = (ts: Timestamp): string => {
  return format(ts.toDate(), "dd-MM-yyyy 'at' HH:mm", { locale: da });
};
