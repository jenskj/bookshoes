import { create } from 'zustand';
import { FirestoreMeeting } from '../types';

interface MeetingStore {
  meetings: FirestoreMeeting[];
  setMeetings: (newMeetings: FirestoreMeeting[]) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  setMeetings: (meetings) =>
    set(() => ({
      meetings,
    })),
}));
