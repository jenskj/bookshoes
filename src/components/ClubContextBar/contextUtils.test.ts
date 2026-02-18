import { describe, expect, it } from 'vitest';
import type { Club } from '@types';
import {
  computeOptimisticClubContext,
  shouldSwitchClub,
} from './contextUtils';

const makeClub = (docId: string, name: string): Club => ({
  docId,
  data: {
    name,
    isPrivate: false,
  },
});

describe('contextUtils', () => {
  it('switches to selected club optimistically', () => {
    const current = makeClub('club-1', 'Alpha');
    const selected = makeClub('club-2', 'Beta');
    expect(
      computeOptimisticClubContext(current, { type: 'select', club: selected })
    ).toEqual(selected);
  });

  it('leaves active club context', () => {
    const current = makeClub('club-1', 'Alpha');
    expect(
      computeOptimisticClubContext(current, { type: 'leave' })
    ).toBeUndefined();
  });

  it('avoids switching when target is current club', () => {
    expect(shouldSwitchClub('club-1', 'club-1')).toBe(false);
    expect(shouldSwitchClub('club-1', 'club-2')).toBe(true);
  });
});
