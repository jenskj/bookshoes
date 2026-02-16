import { create } from 'zustand';
import { Meeting } from '../types';
import { persist } from 'zustand/middleware';

interface MeetingStore {
  meetings: Meeting[];
  setMeetings: (newMeetings?: Meeting[]) => void;
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
