import { FirestoreClub } from '../../types';
import { StyledBottom, StyledClubCard, StyledClubName, StyledTop } from './styles';

interface ClubProps {
  club: FirestoreClub;
}

export const Club = ({
  club: {
    data: { name, isPrivate },
  },
}: ClubProps) => {
 
  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
      </StyledTop>
      <StyledBottom>
        <div>Join this club</div>
      </StyledBottom>
    </StyledClubCard>
  );
};
