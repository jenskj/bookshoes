export type ClubMemberRole = 'admin' | 'moderator' | 'standard';

export const isClubMemberRole = (value: unknown): value is ClubMemberRole => {
  return value === 'admin' || value === 'moderator' || value === 'standard';
};

export interface ResolveMembershipRoleWithRetryOptions {
  initialRole: ClubMemberRole | null;
  canRetry: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  fetchMembershipRole: () => Promise<ClubMemberRole | null>;
  waitForMs?: (durationMs: number) => Promise<void>;
}

const defaultWaitForMs = (durationMs: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

export const resolveMembershipRoleWithRetry = async (
  options: ResolveMembershipRoleWithRetryOptions
): Promise<ClubMemberRole | null> => {
  const maxRetries = options.maxRetries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 180;
  const waitForMs = options.waitForMs ?? defaultWaitForMs;

  if (options.initialRole || !options.canRetry || maxRetries <= 0) {
    return options.initialRole;
  }

  let role: ClubMemberRole | null = options.initialRole;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    await waitForMs(retryDelayMs * (attempt + 1));
    role = await options.fetchMembershipRole();
    if (role) {
      break;
    }
  }

  return role;
};
