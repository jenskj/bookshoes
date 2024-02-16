import { Timestamp, arrayUnion } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { auth } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { FirestoreBook } from '../../types';
import { notEmpty, updateDocument } from '../../utils';
import { Rating } from './Rating';
import { StyledRatingList } from './styles';

interface RatingListProps {
  book: FirestoreBook;
}

interface RatingGroups {
  currentUser: number | null;
  average: number | null;
  members: number[];
}

export const RatingList = ({ book }: RatingListProps) => {
  const { activeClub, members } = useCurrentUserStore();
  const [ratings, setRatings] = useState<RatingGroups>({
    currentUser: null,
    average: null,
    members: [],
  });

  const updateRatings = useCallback(() => {
    if (book.data.ratings?.length && members?.length) {
      const userRating = book.data.ratings?.find(
        (rating) => rating.memberId === auth.currentUser?.uid
      )?.rating;

      const allRatings = book.data.ratings
        .map((rating) => (rating.rating ? rating.rating : null))
        .filter(notEmpty);

      let averageRating = 0;
      if (allRatings) {
        averageRating =
          allRatings?.reduce((a, b) => a + b, 0) / allRatings?.length;
      }

      const membersRatings = book.data.ratings
        ?.map((rating) =>
          rating.memberId !== auth.currentUser?.uid ? rating.rating : null
        )
        .filter(notEmpty);

      setRatings({
        currentUser: userRating || null,
        average: averageRating || null,
        members: membersRatings || [],
      });
    }
  }, [book.data.ratings, members]);

  useEffect(() => {
    if (book.data.ratings && members) {
      updateRatings();
    }
  }, [book.data.ratings, members, updateRatings]);

  useEffect(() => {
    if (book.docId && activeClub && ratings?.currentUser !== null) {
      const userRating = book?.data.ratings?.find(
        (rating) => rating.memberId === auth.currentUser?.uid
      );

      if (!userRating) {
        // If user doesn't have a rating, add it to the array.
        updateDocument(
          `clubs/${activeClub?.docId}/books`,
          {
            ratings: arrayUnion({
              memberId: auth?.currentUser?.uid,
              rating: ratings.currentUser || 0,
              dateAdded: Timestamp.now(),
            }),
          },
          book.docId
        );
      } else if (userRating && ratings.currentUser !== userRating.rating) {
        // If user already has a rating and the rating state has changed, rewrite the whole array to upsert it.
        const userIndex = book.data.ratings?.findIndex(
          (item) => item.memberId === userRating.memberId
        );

        if (
          userIndex !== undefined &&
          userIndex !== null &&
          book?.data.ratings
        ) {
          const newRatings = [...(book?.data.ratings || [])];
          newRatings[userIndex] = {
            ...book?.data.ratings[userIndex],
            rating: ratings.currentUser || 0,
            dateModified: Timestamp.now(),
          };

          updateDocument(
            `clubs/${activeClub?.docId}/books`,
            {
              ratings: newRatings,
            },
            book.docId
          );
        }
      }
    }
  }, [ratings?.currentUser, book.docId, activeClub]);

  return (
    <StyledRatingList>
      <Rating
        title={ratings.currentUser ? 'Your Rating' : 'Rate this book'}
        rating={ratings.currentUser || 0}
        onRatingChange={(rating: number) => {
          setRatings({
            ...ratings,
            currentUser: rating,
          });
        }}
      />
      {ratings.average ? (
        <Rating rating={ratings.average} title="Average" isReadOnly={true} />
      ) : null}

      {members?.map((member) => {
        const memberRating = book.data.ratings?.find(
          (rating) => rating.memberId === member.docId
        );
        return memberRating ? (
          <Rating
            key={member.docId}
            title={member.data.displayName}
            isReadOnly={true}
            rating={memberRating.rating}
          />
        ) : null;
      })}
    </StyledRatingList>
  );
};
