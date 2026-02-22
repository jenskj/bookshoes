import { create } from 'zustand';
import { Meeting } from '@types';

interface MeetingStore {
  meetings: Meeting[];
  setMeetings: (newMeetings?: Meeting[]) => void;
  upsertMeeting: (meeting: Meeting) => void;
  removeMeeting: (meetingId: string) => void;
}

export const useMeetingStore = create<MeetingStore>(
  (set) => ({
    meetings: [],
    setMeetings: (meetings) =>
      set(() => ({
        meetings: meetings ?? [],
      })),
    upsertMeeting: (meeting) =>
      set((state) => {
        const index = state.meetings.findIndex(
          (entry) => entry.docId === meeting.docId
        );
        if (index === -1) {
          return { meetings: [...state.meetings, meeting] };
        }
        const nextMeetings = [...state.meetings];
        nextMeetings[index] = meeting;
        return { meetings: nextMeetings };
      }),
    removeMeeting: (meetingId) =>
      set((state) => ({
        meetings: state.meetings.filter((meeting) => meeting.docId !== meetingId),
      })),
  })
);
