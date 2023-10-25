import React, { useEffect, useState } from 'react';
import { ClubInfo, FirestoreClub } from '../../types';
import { DocumentData } from 'firebase/firestore';
import { firestore } from '../../firestore';
import { StyledClubsContainer } from './styles';
import { Club } from '../../components';
import { Link } from 'react-router-dom';

export const Clubs = () => {
  const [clubs, setClubs] = useState<FirestoreClub[]>();
  useEffect(() => {
    const unsubscribeClubs = firestore
      .collection('clubs')
      .onSnapshot((snapshot) => {
        const newClubs = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as ClubInfo,
        })) as FirestoreClub[];
        setClubs(newClubs);
      });
    return () => {
      unsubscribeClubs();
    };
  }, []);
  return (
    <StyledClubsContainer>
      {clubs?.length &&
        clubs?.map((club) => (
          <Link key={club.docId} to={`/clubs/${club.docId}`}>
            <Club club={club} />
          </Link>
        ))}
    </StyledClubsContainer>
  );
};
