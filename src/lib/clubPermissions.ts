import type { ClubPermissionSnapshot, UserRole } from '@types';

export const getClubPermissionSnapshot = (
  role: UserRole | undefined,
  isMember: boolean
): ClubPermissionSnapshot => {
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';

  return {
    isMember,
    role,
    canEditClubProfile: isAdmin,
    canCreateInvites: isAdmin || isModerator,
    canReviewJoinRequests: isAdmin || isModerator,
    canManageRoles: isAdmin,
    canRemoveMembers: isAdmin || isModerator,
  };
};

export const canActorRemoveMember = (
  actorRole: UserRole | undefined,
  targetRole: UserRole,
  isSelf: boolean
): boolean => {
  if (isSelf) return false;

  if (actorRole === 'admin') {
    return targetRole !== 'admin';
  }

  if (actorRole === 'moderator') {
    return targetRole === 'standard';
  }

  return false;
};

export const canActorChangeMemberRole = (
  actorRole: UserRole | undefined,
  isSelf: boolean
): boolean => {
  return actorRole === 'admin' && !isSelf;
};

export const roleDisplayName = (role: UserRole): string => {
  if (role === 'admin') return 'Admin';
  if (role === 'moderator') return 'Moderator';
  return 'Member';
};
