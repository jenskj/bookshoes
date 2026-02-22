import { beforeEach, describe, expect, it } from 'vitest';
import { useMeetingStore } from './useMeetingStore';

describe('useMeetingStore', () => {
  beforeEach(() => {
    useMeetingStore.setState({ meetings: [] });
  });

  it('upserts and replaces meetings by docId', () => {
    const { upsertMeeting } = useMeetingStore.getState();

    upsertMeeting({ docId: 'meeting-1', data: { date: '2026-02-22' } });
    upsertMeeting({ docId: 'meeting-1', data: { date: '2026-03-01' } });

    const meetings = useMeetingStore.getState().meetings;
    expect(meetings).toHaveLength(1);
    expect(meetings[0].data.date).toBe('2026-03-01');
  });

  it('removes meetings by docId', () => {
    const { setMeetings, removeMeeting } = useMeetingStore.getState();

    setMeetings([
      { docId: 'meeting-1', data: { date: '2026-02-22' } },
      { docId: 'meeting-2', data: { date: '2026-03-01' } },
    ]);
    removeMeeting('meeting-1');

    const meetings = useMeetingStore.getState().meetings;
    expect(meetings).toHaveLength(1);
    expect(meetings[0].docId).toBe('meeting-2');
  });
});
