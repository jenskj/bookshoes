import { styled } from '@mui/material';

export const StyledRatingList = styled('ul')(({ theme }) => ({
  display: 'grid',
  width: '100%',
}));

export const StyledRating = styled('li')(({ theme }) => ({}));
export const StyledRatingHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));
