import { describe, expect, it, vi } from 'vitest';
import {
  isClubMemberRole,
  resolveMembershipRoleWithRetry,
} from './adminAccess';

describe('adminAccess', () => {
  it('validates member role values', () => {
    expect(isClubMemberRole('admin')).toBe(true);
    expect(isClubMemberRole('moderator')).toBe(true);
    expect(isClubMemberRole('standard')).toBe(true);
    expect(isClubMemberRole('owner')).toBe(false);
    expect(isClubMemberRole(null)).toBe(false);
  });

  it('returns initial role without retry', async () => {
    const fetchMembershipRole = vi.fn(async () => 'admin' as const);

    const result = await resolveMembershipRoleWithRetry({
      initialRole: 'moderator',
      canRetry: true,
      fetchMembershipRole,
    });

    expect(result).toBe('moderator');
    expect(fetchMembershipRole).not.toHaveBeenCalled();
  });

  it('retries membership lookup and resolves delayed role', async () => {
    const waitForMs = vi.fn(async () => undefined);
    const fetchMembershipRole = vi
      .fn<() => Promise<'admin' | null>>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('admin');

    const result = await resolveMembershipRoleWithRetry({
      initialRole: null,
      canRetry: true,
      maxRetries: 3,
      retryDelayMs: 200,
      fetchMembershipRole,
      waitForMs,
    });

    expect(result).toBe('admin');
    expect(fetchMembershipRole).toHaveBeenCalledTimes(2);
    expect(waitForMs).toHaveBeenCalledTimes(2);
    expect(waitForMs).toHaveBeenNthCalledWith(1, 200);
    expect(waitForMs).toHaveBeenNthCalledWith(2, 400);
  });

  it('returns null without retry when membership is unknown locally', async () => {
    const fetchMembershipRole = vi.fn(async () => 'admin' as const);

    const result = await resolveMembershipRoleWithRetry({
      initialRole: null,
      canRetry: false,
      fetchMembershipRole,
    });

    expect(result).toBeNull();
    expect(fetchMembershipRole).not.toHaveBeenCalled();
  });
});
