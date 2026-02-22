import { describe, expect, it } from 'vitest';
import {
  canActorChangeMemberRole,
  canActorRemoveMember,
  getClubPermissionSnapshot,
  roleDisplayName,
} from './clubPermissions';

describe('clubPermissions', () => {
  it('builds admin permissions', () => {
    expect(getClubPermissionSnapshot('admin', true)).toEqual({
      isMember: true,
      role: 'admin',
      canEditClubProfile: true,
      canCreateInvites: true,
      canReviewJoinRequests: true,
      canManageRoles: true,
      canRemoveMembers: true,
    });
  });

  it('builds moderator permissions', () => {
    expect(getClubPermissionSnapshot('moderator', true)).toEqual({
      isMember: true,
      role: 'moderator',
      canEditClubProfile: false,
      canCreateInvites: true,
      canReviewJoinRequests: true,
      canManageRoles: false,
      canRemoveMembers: true,
    });
  });

  it('builds standard-member permissions', () => {
    expect(getClubPermissionSnapshot('standard', true)).toEqual({
      isMember: true,
      role: 'standard',
      canEditClubProfile: false,
      canCreateInvites: false,
      canReviewJoinRequests: false,
      canManageRoles: false,
      canRemoveMembers: false,
    });
  });

  it('builds non-member permissions', () => {
    expect(getClubPermissionSnapshot(undefined, false)).toEqual({
      isMember: false,
      role: undefined,
      canEditClubProfile: false,
      canCreateInvites: false,
      canReviewJoinRequests: false,
      canManageRoles: false,
      canRemoveMembers: false,
    });
  });

  it('enforces remove-member matrix', () => {
    expect(canActorRemoveMember('admin', 'moderator', false)).toBe(true);
    expect(canActorRemoveMember('admin', 'admin', false)).toBe(false);
    expect(canActorRemoveMember('moderator', 'standard', false)).toBe(true);
    expect(canActorRemoveMember('moderator', 'moderator', false)).toBe(false);
    expect(canActorRemoveMember('standard', 'standard', false)).toBe(false);
    expect(canActorRemoveMember('admin', 'standard', true)).toBe(false);
  });

  it('limits role changes to admins and non-self targets', () => {
    expect(canActorChangeMemberRole('admin', false)).toBe(true);
    expect(canActorChangeMemberRole('admin', true)).toBe(false);
    expect(canActorChangeMemberRole('moderator', false)).toBe(false);
  });

  it('returns user-friendly role labels', () => {
    expect(roleDisplayName('admin')).toBe('Admin');
    expect(roleDisplayName('moderator')).toBe('Moderator');
    expect(roleDisplayName('standard')).toBe('Member');
  });
});
