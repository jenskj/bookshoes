import type { UserRole } from '@types';

export const getPrivilegedClubRoleLabel = (
  role: UserRole | null | undefined
): string | null => {
  if (role === 'admin') return 'Admin';
  if (role === 'moderator') return 'Moderator';
  return null;
};

export const formatClubTitleWithRole = (
  clubTitle: string,
  role: UserRole | null | undefined
): string => {
  const roleLabel = getPrivilegedClubRoleLabel(role);
  return roleLabel ? `${clubTitle} (${roleLabel})` : clubTitle;
};
