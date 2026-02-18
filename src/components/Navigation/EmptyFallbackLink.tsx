import { UIButton } from '@components/ui';
import { Link } from 'react-router-dom';
import { StyledLinkContainer, StyledLinkTitle } from './styles';

interface EmptyFallbackLinkProps {
  title: string;
  link?: string;
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
      {buttonText && link ? (
        <Link to={'/' + link} style={{ textDecoration: 'none' }}>
          <UIButton variant="primary" className="focus-ring">
            {buttonText || ''}
          </UIButton>
        </Link>
      ) : null}
    </StyledLinkContainer>
  );
};
