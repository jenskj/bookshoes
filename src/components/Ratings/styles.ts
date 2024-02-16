import { styled } from '@mui/material';

export const StyledRatingList = styled('ul')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  width: '100%',
}));

export const StyledRating = styled('li')(({ theme }) => ({
  display: 'gap',
  alignItems: 'center',
  gap: theme.spacing(1),
  flex: 1,
}));

export const StyledRatingHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  height: 34,
  alignItems: 'center',
}));
