import { describe, expect, it } from 'vitest';
import { mapClubInviteRow, mapClubJoinRequestRow, mapClubRow } from './mappers';

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

  it('normalizes club join mode against privacy', () => {
    const mappedPublic = mapClubRow({
      id: 'club-1',
      name: 'Readers',
      is_private: false,
      tagline: null,
      description: null,
      settings: {
        access: {
          joinMode: 'invite_only',
        },
      },
    });
    const mappedPrivate = mapClubRow({
      id: 'club-2',
      name: 'Readers Private',
      is_private: true,
      tagline: null,
      description: null,
      settings: {
        access: {
          joinMode: 'public_direct',
        },
      },
    });

    expect(mappedPublic.data.settings?.access.joinMode).toBe('public_direct');
    expect(mappedPrivate.data.settings?.access.joinMode).toBe('invite_or_request');
  });
});
