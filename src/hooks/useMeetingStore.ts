import { create } from 'zustand';
import { FirestoreMeeting } from '../types';
import { persist } from 'zustand/middleware';

interface MeetingStore {
  meetings: FirestoreMeeting[];
  setMeetings: (newMeetings?: FirestoreMeeting[]) => void;
}

export const useMeetingStore = create(
  persist<MeetingStore>(
    (set) => ({
      meetings: [],
      setMeetings: (meetings) =>
        set(() => ({
          meetings,
        })),
    }),
    {
      name: 'meeting-storage', // name of the item in the storage (must be unique)
    }
  )
);
