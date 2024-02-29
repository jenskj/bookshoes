import { FirestoreClub } from '@types';
import {
  StyledBottom,
  StyledClubCard,
  StyledClubName,
  StyledMiddle,
  StyledTagline,
  StyledTop,
} from './styles';

interface ClubProps {
  club: FirestoreClub;
}

export const Club = ({
  club: {
    data: { name, isPrivate, tagline, description },
  },
}: ClubProps) => {
  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
        {tagline ? <StyledTagline>{tagline}</StyledTagline> : null}
      </StyledTop>
      <StyledMiddle></StyledMiddle>
      <StyledBottom>
        <div>Join this club</div>
      </StyledBottom>
    </StyledClubCard>
  );
};
