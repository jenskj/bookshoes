import { UIButton } from '@components/ui';
import { Link } from 'react-router-dom';
import { StyledLinkContainer } from './styles';

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
      <div>{title}</div>
      {buttonText && link ? (
        <Link to={`/${link}`}>
          <UIButton variant="primary" className="focus-ring">
            {buttonText || ''}
          </UIButton>
        </Link>
      ) : null}
    </StyledLinkContainer>
  );
};
