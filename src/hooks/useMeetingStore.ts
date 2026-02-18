import { create } from 'zustand';
import { Meeting } from '@types';

interface MeetingStore {
  meetings: Meeting[];
  setMeetings: (newMeetings?: Meeting[]) => void;
}

export const useMeetingStore = create<MeetingStore>(
  (set) => ({
    meetings: [],
    setMeetings: (meetings) =>
      set(() => ({
        meetings,
      })),
  })
);
