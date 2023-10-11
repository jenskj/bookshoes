import { styled } from '@mui/material';

export const StyledMeetingDetailsPage = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

interface StyledBooksBannerProps {
  bookAmount: number;
}

export const StyledBooksBanner = styled('div')<StyledBooksBannerProps>(
  ({ theme, bookAmount }) => ({
    display: 'grid',
    gridGap: '1rem',

    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: `repeat(${
        bookAmount <= 1 ? 1 : 2
      }, minmax(65px, 1fr))`,
    },
  })
);
export const StyledHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  flexDirection: 'column-reverse',
  alignItems: 'initial',

  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    '> *': {
      flex: 1,
    },
  },
}));

export const StyledLocation = styled('h3')(({ theme }) => ({}));

export const StyledDateHeader = styled('h2')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'nowrap',
  },
}));

export const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),

  svg: {
    transition: 'color 200ms ease-in-out',
    ':hover': {
      color: theme.palette.primary.main,
    },
  },
}));
