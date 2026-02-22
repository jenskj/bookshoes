import { create } from 'zustand';
import { Meeting } from '@types';
import { removeByDocId, upsertByDocId } from '@lib/storeCollections';

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
        return { meetings: upsertByDocId(state.meetings, meeting) };
      }),
    removeMeeting: (meetingId) =>
      set((state) => ({
        meetings: removeByDocId(state.meetings, meetingId),
      })),
  })
);
