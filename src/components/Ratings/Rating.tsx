import { Rating as MuiRating, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { StyledRating } from './styles';

interface RatingProps {
  title: string;
  rating: number;
  isReadOnly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const Rating = ({
  rating,
  isReadOnly = false,
  onRatingChange,
  title,
}: RatingProps) => {
  const [ratingValue, setRatingValue] = useState<number | null>(0);

  useEffect(() => {
    if (rating && ratingValue !== rating) {
      setRatingValue(rating);
    }
  }, [rating, setRatingValue, ratingValue]);

  const handleRatingChange = (ratingValue: number) => {
    if (ratingValue && ratingValue !== rating && onRatingChange) {
      onRatingChange(ratingValue);
    }
  };

  return (
    <StyledRating>
      <Typography component="legend">{title}</Typography>
      <MuiRating
        name="simple-controlled"
        value={ratingValue}
        readOnly={isReadOnly}
        onChange={(e, newValue) => {
          handleRatingChange(newValue || 0);
        }}
      />
    </StyledRating>
  );
};
