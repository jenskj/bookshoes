import { IconButton } from '@mui/material';
import { StyledArrowIcon, StyledPreviewButtonContainer } from './styles';
import { Link } from 'react-router-dom';

interface ExtendPreviewButtonProps {
  direction?: 'horizontal' | 'vertical';
  destination: 'books' | 'meetings';
}

export const ExtendPreviewButton = ({
  direction = 'horizontal',
  destination,
}: ExtendPreviewButtonProps) => {
  return (
    <StyledPreviewButtonContainer>
      <IconButton
        component={Link}
        to={`/${destination}`}
        aria-label={`Navigate to ${destination}`}
      >
        <StyledArrowIcon direction={direction} />
      </IconButton>
    </StyledPreviewButtonContainer>
  );
};
