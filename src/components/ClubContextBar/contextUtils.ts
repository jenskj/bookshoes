import { Club } from '@types';

type ClubContextAction =
  | { type: 'select'; club: Club }
  | { type: 'leave' };

export const computeOptimisticClubContext = (
  currentClub: Club | undefined,
  action: ClubContextAction
) => {
  if (action.type === 'leave') return undefined;
  if (currentClub?.docId === action.club.docId) return currentClub;
  return action.club;
};

export const shouldSwitchClub = (
  currentClubId: string | undefined,
  targetClubId: string | undefined
) => {
  return Boolean(targetClubId && currentClubId !== targetClubId);
};
