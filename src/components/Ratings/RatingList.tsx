import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { Book } from '@types';
import { notEmpty, updateBook } from '@utils';
import { Rating } from './Rating';
import { StyledRatingList } from './styles';

interface RatingListProps {
  book: Book;
}

interface RatingGroups {
  currentUser: number | null;
  average: number | null;
  members: number[];
}

export const RatingList = ({ book }: RatingListProps) => {
  const { activeClub, members } = useCurrentUserStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<RatingGroups>({
    currentUser: null,
    average: null,
    members: [],
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  const updateRatings = useCallback(() => {
    if (book.data.ratings?.length && members?.length) {
      const userRating = book.data.ratings?.find(
        (rating) => rating.memberId === userId
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
          rating.memberId !== userId ? rating.rating : null
        )
        .filter(notEmpty);

      setRatings({
        currentUser: userRating ?? null,
        average: averageRating || null,
        members: membersRatings || [],
      });
    }
  }, [book.data.ratings, members, userId]);

  useEffect(() => {
    if (book.data.ratings && members) {
      updateRatings();
    }
  }, [book.data.ratings, members, updateRatings]);

  useEffect(() => {
    if (book.docId && activeClub && ratings?.currentUser !== null && userId) {
      const userRating = book?.data.ratings?.find(
        (rating) => rating.memberId === userId
      );

      if (!userRating) {
        const newRatings = [
          ...(book.data.ratings || []),
          {
            memberId: userId,
            rating: ratings.currentUser || 0,
            dateAdded: new Date().toISOString(),
          },
        ];
        updateBook(activeClub.docId, book.docId, { ratings: newRatings });
      } else if (userRating && ratings.currentUser !== userRating.rating) {
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
            dateModified: new Date().toISOString(),
          };

          updateBook(activeClub.docId, book.docId, { ratings: newRatings });
        }
      }
    }
  }, [ratings?.currentUser, book.docId, book.data.ratings, activeClub, userId]);

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
          (rating) => rating.memberId === member.data.uid
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
