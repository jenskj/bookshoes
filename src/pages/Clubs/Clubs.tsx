import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Club } from '../../components';
import { auth, firestore } from '../../firestore';
import { ClubInfo, FirestoreClub, MemberInfo } from '../../types';
import { StyledPageTitle } from '../styles';
import {
  StyledClubsContainer,
  StyledClubsSectionsContainer,
  StyledMemberSection,
  StyledNewSection,
} from './styles';

export const Clubs = () => {
  const [nonMemberClubs, setNonMemberClubs] = useState<FirestoreClub[]>([]);
  const [memberClubs, setMemberClubs] = useState<FirestoreClub[]>([]);

  useEffect(() => {
    const unsubscribeClubs = firestore
      .collection('clubs')
      .onSnapshot(async (snapshot) => {
        for (const doc of snapshot.docs) {
          const newClub = {
            docId: doc.id,
            data: doc.data() as ClubInfo,
          };

          // Early return if the club already exists on a list
          if (
            nonMemberClubs.some((club) => club.docId === newClub.docId) ||
            memberClubs.some((club) => club.docId === newClub.docId)
          ) {
            return;
          }

          const membersRef = firestore.collection(
            `clubs/${newClub.docId}/members`
          );

          // Get members of the currently iterated club
          const membersData = await membersRef.get();

          const newMembers = membersData.docs.map((member) => {
            return { docId: member.id, data: member.data() as MemberInfo };
          });

          const isMember = newMembers.some(
            (member) => member.data.user.docId === auth.currentUser?.uid
          );

          // If the current user is a member, add the club to the memberClubs list, and if not to the nonMemberClubs list
          if (isMember) {
            setMemberClubs((prev) => [...prev, newClub]);
          } else {
            setNonMemberClubs((prev) => [...prev, newClub]);
          }
        }
      });
    return () => {
      unsubscribeClubs();
    };
  }, []);

  return (
    <StyledClubsSectionsContainer>
      <StyledMemberSection>
        <StyledPageTitle>Your clubs</StyledPageTitle>
        <StyledClubsContainer>
          {memberClubs?.length
            ? memberClubs?.map((club) => (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              ))
            : null}
        </StyledClubsContainer>
      </StyledMemberSection>
      <StyledNewSection>
        <StyledPageTitle>New Clubs</StyledPageTitle>

        <StyledClubsContainer>
          {nonMemberClubs?.length
            ? nonMemberClubs?.map((club) => (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              ))
            : null}
        </StyledClubsContainer>
      </StyledNewSection>
    </StyledClubsSectionsContainer>
  );
};
