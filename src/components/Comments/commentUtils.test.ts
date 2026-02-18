import { describe, expect, it } from 'vitest';
import type { MeetingComment } from '@types';
import { getRevealAfterPage, shouldHideSpoiler } from './commentUtils';

const makeComment = (
  overrides: Partial<MeetingComment> = {}
): MeetingComment => ({
  text: 'Sample note',
  title: 'Sample',
  dateAdded: new Date().toISOString(),
  user: {
    uid: 'user-1',
    displayName: 'Reader',
    photoURL: '',
  },
  ...overrides,
});

describe('commentUtils', () => {
  it('hides spoiler when viewer page is below reveal threshold including page 0', () => {
    const comment = makeComment({
      citation: { page: 140 },
      spoiler: { enabled: true, revealAfterPage: 150 },
    });
    expect(shouldHideSpoiler(comment, 0)).toBe(true);
    expect(shouldHideSpoiler(comment, 149)).toBe(true);
  });

  it('does not hide spoiler when threshold reached', () => {
    const comment = makeComment({
      citation: { page: 140 },
      spoiler: { enabled: true, revealAfterPage: 150 },
    });
    expect(shouldHideSpoiler(comment, 150)).toBe(false);
    expect(shouldHideSpoiler(comment, 200)).toBe(false);
  });

  it('falls back to citation page for reveal threshold when spoiler page is missing', () => {
    const comment = makeComment({
      citation: { page: 88 },
      spoiler: { enabled: true },
    });
    expect(getRevealAfterPage(comment)).toBe(88);
    expect(shouldHideSpoiler(comment, 40)).toBe(true);
    expect(shouldHideSpoiler(comment, 88)).toBe(false);
  });
});
