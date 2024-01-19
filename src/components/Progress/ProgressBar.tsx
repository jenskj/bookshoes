import { StyledProgressBar } from './styles';

interface ProgressBarProps {
  currentPage: number;
}

export const ProgressBar = ({ currentPage }: ProgressBarProps) => {
  return <StyledProgressBar>{currentPage}</StyledProgressBar>;
};
