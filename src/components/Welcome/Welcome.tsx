import React, { useEffect, useState } from 'react';
import { StyledActionsContainer } from './styles';
import { Button } from '@mui/material';
import { DocumentData } from 'firebase/firestore';
import { firestore } from '../../firestore';
import { FirestoreClub, ClubInfo } from '../../types';
import { ClubForm } from './ClubForm';

export const Welcome = () => {
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [clubs, setClubs] = useState<FirestoreClub[]>();

  useEffect(() => {
    // Consider making this a simple ref lik in ClubForm
    firestore.collection('clubs').onSnapshot((snapshot) => {
      const newClubs = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as ClubInfo,
      })) as FirestoreClub[];
      setClubs(newClubs);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StyledActionsContainer>
        <Button variant="contained">Join book club</Button>
        <Button variant="contained" onClick={() => setActiveModal(true)}>
          Create new book club
        </Button>
      </StyledActionsContainer>
      <ClubForm isOpen={activeModal} onClose={() => setActiveModal(false)} />
    </>
  );
};
