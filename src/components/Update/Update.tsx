import { StyledBullet, StyledBulletContainer, StyledDate, StyledUpdate } from './styles';
interface UpdateProps {
  bullets: string[];
  date: string;
}

export const Update = ({ bullets, date }: UpdateProps) => {
  return (
    <StyledUpdate>
      <StyledDate>{date}</StyledDate>
      <StyledBulletContainer>
        {bullets &&
          bullets.map((bullet) => <StyledBullet>{bullet}</StyledBullet>)}
      </StyledBulletContainer>
    </StyledUpdate>
  );
};
