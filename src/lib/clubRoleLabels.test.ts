import { describe, expect, it } from 'vitest';
import { formatClubTitleWithRole, getPrivilegedClubRoleLabel } from './clubRoleLabels';

describe('clubRoleLabels', () => {
  it('returns labels only for privileged roles', () => {
    expect(getPrivilegedClubRoleLabel('admin')).toBe('Admin');
    expect(getPrivilegedClubRoleLabel('moderator')).toBe('Moderator');
    expect(getPrivilegedClubRoleLabel('standard')).toBeNull();
    expect(getPrivilegedClubRoleLabel(undefined)).toBeNull();
  });

  it('formats club titles with role suffix for privileged members', () => {
    expect(formatClubTitleWithRole('Late Night Library', 'admin')).toBe(
      'Late Night Library (Admin)'
    );
    expect(formatClubTitleWithRole('Late Night Library', 'moderator')).toBe(
      'Late Night Library (Moderator)'
    );
    expect(formatClubTitleWithRole('Late Night Library', 'standard')).toBe(
      'Late Night Library'
    );
  });
});
