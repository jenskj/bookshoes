import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createClubWithAdmin,
  isLegacyCreateClubSignatureError,
} from './clubs';
import { supabase } from '@lib/supabase';

vi.mock('@lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('createClubWithAdmin', () => {
  const rpcMock = vi.mocked(supabase.rpc);

  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('creates a club using settings-aware RPC signature', async () => {
    rpcMock.mockResolvedValueOnce({
      data: 'club-new',
      error: null,
    } as Awaited<ReturnType<typeof supabase.rpc>>);

    const result = await createClubWithAdmin({
      name: 'New Club',
      isPrivate: true,
      settings: {
        setup: { preset: 'general' },
        access: {
          joinMode: 'invite_only',
          autoPromoteFirstMembersToModerator: 0,
        },
        meetings: {
          cadence: 'weekly',
          preferredWeekday: 1,
          preferredTime: '19:00',
          timezone: 'system',
        },
        readingWorkflow: {
          votingWindowDays: 7,
          autoPromoteWinner: false,
          autoMarkReadMinimumScheduledMeetings: 2,
        },
        invites: {
          defaultExpiryDays: 7,
          defaultMaxUses: null,
        },
        discussion: {
          spoilerPolicy: 'off',
          spoilerRevealAfterPage: null,
          defaultNoteType: 'comment',
        },
        onboarding: {
          message: '',
          rules: '',
        },
        branding: {
          accentPreset: 'classic',
          emoji: '',
          coverUrl: '',
        },
      },
    });

    expect(result).toEqual({ id: 'club-new' });
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith(
      'create_club_with_admin',
      expect.objectContaining({
        p_name: 'New Club',
        p_is_private: true,
      })
    );
    const payload = rpcMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.p_settings).toBeDefined();
  });

  it('falls back to legacy RPC signature when p_settings signature is unavailable', async () => {
    rpcMock
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST202',
          message: 'Could not find function public.create_club_with_admin(p_settings => jsonb)',
        },
      } as Awaited<ReturnType<typeof supabase.rpc>>)
      .mockResolvedValueOnce({
        data: 'club-legacy',
        error: null,
      } as Awaited<ReturnType<typeof supabase.rpc>>);

    const result = await createClubWithAdmin({
      name: 'Legacy Compatible Club',
    });

    expect(result).toEqual({ id: 'club-legacy' });
    expect(rpcMock).toHaveBeenCalledTimes(2);
    expect(rpcMock.mock.calls[1]?.[0]).toBe('create_club_with_admin');
    const legacyPayload = rpcMock.mock.calls[1]?.[1] as Record<string, unknown>;
    expect(legacyPayload.p_settings).toBeUndefined();
  });

  it('throws original error when first attempt fails for unrelated reasons', async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied',
      },
    } as Awaited<ReturnType<typeof supabase.rpc>>);

    await expect(
      createClubWithAdmin({
        name: 'Failure',
      })
    ).rejects.toMatchObject({
      code: '42501',
    });
  });
});

describe('isLegacyCreateClubSignatureError', () => {
  it('detects postgrest function-signature mismatch errors', () => {
    expect(
      isLegacyCreateClubSignatureError({
        code: 'PGRST202',
      })
    ).toBe(true);

    expect(
      isLegacyCreateClubSignatureError({
        message: 'Could not find function create_club_with_admin with p_settings',
      })
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(
      isLegacyCreateClubSignatureError({
        code: '42501',
        message: 'permission denied',
      })
    ).toBe(false);
  });
});
