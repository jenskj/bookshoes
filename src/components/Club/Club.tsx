import { memo } from 'react';
import { formatClubTitleWithRole } from '@lib/clubRoleLabels';
import { Club as ClubType, UserRole } from '@types';
import {
  StyledBottom,
  StyledCTA,
  StyledClubCard,
  StyledClubMonogram,
  StyledClubName,
  StyledMembersInfo,
  StyledMiddle,
  StyledText,
  StyledTop,
} from './styles';

interface ClubProps {
  club: ClubType;
  memberCount?: number;
  currentUserRole?: UserRole | null;
}

export const Club = memo(function Club({
  club: {
    data: { name, tagline },
  },
  memberCount = 0,
  currentUserRole,
}: ClubProps) {
  const clubInitial = name.trim().charAt(0).toUpperCase() || '?';
  const clubTitle = formatClubTitleWithRole(name, currentUserRole);

  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubMonogram aria-hidden>{clubInitial}</StyledClubMonogram>
        <StyledClubName>{clubTitle}</StyledClubName>
      </StyledTop>
      <StyledMiddle>
        <StyledText>
          {tagline || 'Pick your next read together and keep the discussion moving.'}
        </StyledText>
      </StyledMiddle>
      <StyledBottom>
        <StyledMembersInfo>Active members: {memberCount}</StyledMembersInfo>
        <StyledCTA variant="ghost">Join this club</StyledCTA>
      </StyledBottom>
    </StyledClubCard>
  );
});
