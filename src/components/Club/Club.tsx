import { firestore } from '@firestore';
import { useBookStore } from '@hooks';
import { FirestoreBook, FirestoreClub, FirestoreMember } from '@types';
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
import { BookCover } from '@components/Book';

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
  const { books } = useBookStore();

  useEffect(() => {
    if (docId) {
      const unsubscribe = firestore
        .collection('clubs')
        .doc(docId)
        .collection('members')
        .onSnapshot((snapshot) => {
          const newMembers = snapshot.docs.map(
            (doc) => doc.data() as FirestoreMember
          );
          if (newMembers) {
            setMembers(newMembers);
          }
        });
      return () => unsubscribe();
    }
  }, [docId]);

  useEffect(() => {
    // This gets the books from the activeClub, not the club shown in the list. This should obviously be changed, but I'll leave it in for now, since it makes the Clubs list prettier :)
    if (books) {
      const currentlyReading = books.filter(
        (book) => book.data.scheduledMeetings?.length
      );
      if (currentlyReading) {
        currentlyReading.sort((a, b) => {
          const aDate = a.data.addedDate;
          const bDate = b.data.addedDate;
          if (aDate && bDate) {
            if (aDate > bDate) {
              return 1;
            }
          }
          return -1;
        });
        setCurrentlyReading(currentlyReading[currentlyReading.length - 1]);
      }
    }
  }, [books]);

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
