import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Club } from '../../components';
import { firestore } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { ClubInfo, FirestoreClub } from '../../types';
import { StyledPageTitle } from '../styles';
import {
  StyledClubsContainer,
  StyledClubsSectionsContainer,
  StyledMemberSection,
  StyledNewSection,
} from './styles';

export const Clubs = () => {
  const [clubs, setClubs] = useState<FirestoreClub[]>([]);
  const { currentUser } = useCurrentUserStore();

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
    <StyledClubsSectionsContainer>
      <StyledMemberSection>
        <StyledPageTitle>Your clubs</StyledPageTitle>
        {/* Member clubs */}
        <StyledClubsContainer>
          {clubs.map(
            (club) =>
              currentUser?.data.memberships?.includes(club.docId) && (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              )
          )}
        </StyledClubsContainer>
      </StyledMemberSection>
      <StyledNewSection>
        <StyledPageTitle>New Clubs</StyledPageTitle>
        {/* Non-member clubs */}
        <StyledClubsContainer>
          {clubs.map(
            (club) =>
              !currentUser?.data.memberships?.includes(club.docId) && (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              )
          )}
        </StyledClubsContainer>
      </StyledNewSection>
    </StyledClubsSectionsContainer>
  );
};
