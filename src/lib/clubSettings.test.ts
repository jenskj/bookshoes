import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CLUB_SETTINGS,
  getEffectiveClubJoinMode,
  normalizeCreateClubAccessMode,
  sanitizeClubSettings,
} from './clubSettings';

describe('clubSettings', () => {
  it('sanitizes unknown payloads to defaults', () => {
    expect(sanitizeClubSettings({})).toEqual(DEFAULT_CLUB_SETTINGS);
  });

  it('sanitizes invalid values and keeps valid values', () => {
    const sanitized = sanitizeClubSettings({
      setup: { preset: 'genre' },
      meetings: { preferredTime: '29:99', preferredWeekday: 9 },
      invites: { defaultMaxUses: -4 },
      discussion: { spoilerPolicy: 'custom_page', spoilerRevealAfterPage: 120 },
      branding: { accentPreset: 'rose' },
    });

    expect(sanitized.setup.preset).toBe('genre');
    expect(sanitized.meetings.preferredTime).toBe('19:00');
    expect(sanitized.meetings.preferredWeekday).toBe(6);
    expect(sanitized.invites.defaultMaxUses).toBe(null);
    expect(sanitized.discussion.spoilerPolicy).toBe('custom_page');
    expect(sanitized.discussion.spoilerRevealAfterPage).toBe(120);
    expect(sanitized.branding.accentPreset).toBe('rose');
  });

  it('normalizes access mode for private clubs', () => {
    expect(normalizeCreateClubAccessMode(true, 'public_direct')).toBe(
      'invite_or_request'
    );
    expect(normalizeCreateClubAccessMode(false, 'invite_only')).toBe(
      'public_direct'
    );
  });

  it('resolves effective join mode from privacy and settings', () => {
    expect(getEffectiveClubJoinMode(false, 'invite_only')).toBe('public_direct');
    expect(getEffectiveClubJoinMode(true, 'public_direct')).toBe(
      'invite_or_request'
    );
    expect(getEffectiveClubJoinMode(true, 'invite_only')).toBe('invite_only');
  });
});
