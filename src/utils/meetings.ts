import type { Meeting } from '@types';
import { parseDate } from './formatDate';

export interface MeetingsByTimeline {
  upcoming: Meeting[];
  past: Meeting[];
}

export const splitMeetingsByTimeline = (
  meetings: Meeting[],
  now: Date = new Date()
): MeetingsByTimeline => {
  const nowMs = now.getTime();

  return meetings.reduce<MeetingsByTimeline>(
    (groups, meeting) => {
      const meetingDate = parseDate(meeting.data.date);
      if (!meetingDate) {
        return groups;
      }

      const meetingMs = meetingDate.getTime();
      if (meetingMs > nowMs) {
        groups.upcoming.push(meeting);
      } else if (meetingMs < nowMs) {
        groups.past.push(meeting);
      }

      return groups;
    },
    { upcoming: [], past: [] }
  );
};
