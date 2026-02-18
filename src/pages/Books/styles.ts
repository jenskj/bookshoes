import { styled } from '@mui/material/styles';
import { StyledPageSection } from '@pages/styles';

export const StyledBookHeaderContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
}));

export const StyledAddButtonContainer = styled('div')(({ theme }) => ({
  display: 'none',
  justifyContent: 'flex-end',
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

export const StyledHeaderContainer = styled('div')(({ theme }) => ({
  justifyContent: 'space-between',
  display: 'flex',
  gap: theme.spacing(1),
  '> *': {
    flex: 1,
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

export const StyledBookDetailsMiddle = styled(StyledPageSection)(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '1fr 1fr',
    },
  })
);
