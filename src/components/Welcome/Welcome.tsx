import { Button } from '@mui/material';
import { useState } from 'react';
import { ClubForm } from '../Club/ClubForm';
import { StyledActionsContainer } from './styles';
import { Link } from 'react-router-dom';

export const Welcome = () => {
  const [activeModal, setActiveModal] = useState<boolean>(false);

  return (
    <>
      <StyledActionsContainer>
        <Button variant="contained" component={Link} to="/clubs">
          Join a book club
        </Button>
        <Button variant="contained" onClick={() => setActiveModal(true)}>
          Create new book club
        </Button>
      </StyledActionsContainer>
      <ClubForm isOpen={activeModal} onClose={() => setActiveModal(false)} />
    </>
  );
};
