import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { StyledLinkContainer, StyledLinkTitle } from './styles';

interface EmptyFallbackLinkProps {
  title: string;
  link: string;
  buttonText?: string;
}
export const EmptyFallbackLink = ({
  title,
  link,
  buttonText,
}: EmptyFallbackLinkProps) => {
  return (
    <StyledLinkContainer>
      <StyledLinkTitle>{title}</StyledLinkTitle>
      <Button variant="contained" component={Link} to={'/' + link}>
        {buttonText || ''}
      </Button>
    </StyledLinkContainer>
  );
};
