import { UIButton } from '@components/ui';
import { useState } from 'react';
import { ClubForm } from '../Club/ClubForm';
import { StyledActionsContainer } from './styles';
import { Link } from 'react-router-dom';

export const Welcome = () => {
  const [activeModal, setActiveModal] = useState<boolean>(false);

  return (
    <>
      <StyledActionsContainer>
        <Link to="/clubs">
          <UIButton variant="primary" className="focus-ring">
            Join a book club
          </UIButton>
        </Link>
        <UIButton
          variant="primary"
          className="focus-ring"
          onClick={() => setActiveModal(true)}
        >
          Create new book club
        </UIButton>
      </StyledActionsContainer>
      <ClubForm isOpen={activeModal} onClose={() => setActiveModal(false)} />
    </>
  );
};
