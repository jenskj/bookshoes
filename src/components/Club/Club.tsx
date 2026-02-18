import { memo } from 'react';
import { Club as ClubType } from '@types';
import {
  StyledBottom,
  StyledCTA,
  StyledClubCard,
  StyledClubName,
  StyledMembersInfo,
  StyledMiddle,
  StyledText,
  StyledTop,
} from './styles';

interface ClubProps {
  club: ClubType;
  memberCount?: number;
}

export const Club = memo(function Club({
  club: {
    data: { name, tagline },
  },
  memberCount = 0,
}: ClubProps) {
  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
        {tagline ? <StyledText>{tagline}</StyledText> : null}
      </StyledTop>
      <StyledMiddle>
        <StyledText>Club reading focus appears on the dashboard.</StyledText>
      </StyledMiddle>
      <StyledBottom>
        <StyledMembersInfo>Active members: {memberCount}</StyledMembersInfo>
        <StyledCTA variant="ghost">Join this club</StyledCTA>
      </StyledBottom>
    </StyledClubCard>
  );
});
