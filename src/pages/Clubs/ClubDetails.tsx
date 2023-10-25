import { Button } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db, firestore } from '../../firestore';
import { ClubInfo } from '../../types';
import { StyledPageTitle } from '../styles';
import { StyledClubDetailsContainer } from './styles';

export const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState<ClubInfo>();

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'clubs', id);
      getDoc(docRef).then((res) => {
        setClub({ ...res.data() } as ClubInfo);
      });
    }
  }, [id]);

  const handleJoin = async () => {
    if (auth.currentUser?.uid) {
      const member = {
        user: firestore.doc('users/' + auth.currentUser?.uid),
        role: 'standard',
      };
      const membersRef = firestore
        .collection('clubs')
        .doc(id)
        .collection('members');

      try {
        await membersRef.add(member);
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <StyledClubDetailsContainer>
      <StyledPageTitle>
        {club?.name} is {club?.isPrivate ? 'private' : 'not private'}
      </StyledPageTitle>
      <Button variant="contained" onClick={handleJoin}>
        Join
      </Button>
    </StyledClubDetailsContainer>
  );
};
