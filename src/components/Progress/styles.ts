import { styled } from '@mui/material';

export const StyledProgressBarList = styled('ul')(({ theme }) => ({
  display: 'grid',
}));

export const StyledProgressBar = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  backgroundColor: 'black',
}));
export const StyledProgressBarContainer = styled('li')(({ theme }) => ({
  height: 20,
}));
