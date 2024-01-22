import { StyledProgressBar, StyledProgressBarContainer } from './styles';

interface ProgressBarProps {
  currentPage: number;
}

export const ProgressBar = ({ currentPage }: ProgressBarProps) => {
  return (
    <StyledProgressBarContainer>
      <StyledProgressBar>{currentPage}</StyledProgressBar>
    </StyledProgressBarContainer>
  );
};
