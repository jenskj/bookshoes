import { BookCover } from '@components/Book';
import { db } from '@firestore';
import { FirestoreBook, FirestoreClub, FirestoreMember } from '@types';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  StyledBottom,
  StyledCTA,
  StyledClubCard,
  StyledClubName,
  StyledMembersInfo,
  StyledMiddle,
  StyledText,
  StyledTop,
} from './styles';

interface ClubProps {
  club: FirestoreClub;
}

export const Club = ({
  club: {
    docId,
    data: { name, isPrivate, tagline, description },
  },
}: ClubProps) => {
  const [members, setMembers] = useState<FirestoreMember[] | null>(null);
  const [currentlyReading, setCurrentlyReading] =
    useState<FirestoreBook | null>(null);

  useEffect(() => {
    if (docId) {
      const unsubscribe = onSnapshot(
        collection(db, `clubs/${docId}/members`),
        (snapshot) => {
          const newMembers = snapshot.docs.map(
            (doc) => doc.data() as FirestoreMember
          );
          if (newMembers) {
            setMembers(newMembers);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [docId]);

  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
        {tagline ? <StyledText variant="caption">{tagline}</StyledText> : null}
      </StyledTop>
      <StyledMiddle>
        {currentlyReading ? (
          <>
            <StyledText>Currently reading:</StyledText>
            <BookCover bookInfo={currentlyReading.data} />
            <StyledText variant="body2">
              {currentlyReading.data.volumeInfo?.title} by{' '}
              {currentlyReading.data.volumeInfo?.authors.join(', ')}
            </StyledText>
          </>
        ) : null}
      </StyledMiddle>
      <StyledBottom>
        <StyledMembersInfo>Active members: {members?.length}</StyledMembersInfo>
        <StyledCTA variant="outlined">Join this club</StyledCTA>
      </StyledBottom>
    </StyledClubCard>
  );
};
