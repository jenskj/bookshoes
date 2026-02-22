import { describe, expect, it } from 'vitest';
import { mapClubInviteRow, mapClubJoinRequestRow } from './mappers';

describe('club governance mappers', () => {
  it('maps club invite rows', () => {
    const mapped = mapClubInviteRow({
      id: 'invite-1',
      club_id: 'club-1',
      invite_code: 'ABC123',
      created_by: 'user-1',
      max_uses: 5,
      uses_count: 2,
      expires_at: '2026-03-01T00:00:00.000Z',
      revoked_at: null,
      created_at: '2026-02-18T00:00:00.000Z',
    });

    expect(mapped).toEqual({
      docId: 'invite-1',
      data: {
        clubId: 'club-1',
        inviteCode: 'ABC123',
        createdBy: 'user-1',
        maxUses: 5,
        usesCount: 2,
        expiresAt: '2026-03-01T00:00:00.000Z',
        revokedAt: null,
        createdAt: '2026-02-18T00:00:00.000Z',
      },
    });
  });

  it('maps join request rows with requester data', () => {
    const mapped = mapClubJoinRequestRow(
      {
        id: 'req-1',
        club_id: 'club-1',
        requester_user_id: 'user-2',
        message: 'Would love to join',
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        created_at: '2026-02-18T10:00:00.000Z',
        updated_at: '2026-02-18T10:00:00.000Z',
      },
      {
        id: 'user-2',
        display_name: 'Taylor Reader',
        photo_url: 'https://example.com/taylor.jpg',
      }
    );

    expect(mapped.data.requester).toEqual({
      uid: 'user-2',
      displayName: 'Taylor Reader',
      photoURL: 'https://example.com/taylor.jpg',
    });
    expect(mapped.data.status).toBe('pending');
    expect(mapped.data.message).toBe('Would love to join');
  });
});
