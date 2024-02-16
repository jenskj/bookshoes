import {
  IconButton,
  Rating as MuiRating,
  Tooltip,
  Typography,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { useEffect, useState } from 'react';
import { StyledRating, StyledRatingHeader } from './styles';

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
    if (rating !== null && ratingValue !== rating) {
      setRatingValue(rating);
    }
  }, [rating, setRatingValue, ratingValue]);

  const handleRatingChange = (ratingValue: number) => {
    if (
      ratingValue !== null &&
      ratingValue !== undefined &&
      ratingValue !== rating &&
      onRatingChange
    ) {
      onRatingChange(ratingValue);
    }
  };

  return (
    <StyledRating>
      <StyledRatingHeader>
        <Typography sx={{ whiteSpace: 'nowrap' }} component="legend">
          {title}
        </Typography>
        {!isReadOnly && ratingValue ? (
          <Tooltip title="Clear rating">
            <IconButton
              aria-label="clear rating"
              size="small"
              disabled={isReadOnly}
              onClick={() => handleRatingChange(0)}
            >
              <HighlightOffIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </StyledRatingHeader>
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
