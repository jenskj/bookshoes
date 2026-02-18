import { styled } from '@mui/material';
import { StyledPageTitle } from '../styles';

export const StyledClubs = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'hidden',
  '.swiper, .swiper-wrapper, .swiper-slide': {
    minWidth: 0,
    maxWidth: '100%',
  },
}));

export const StyledMemberSection = styled('div')(({ theme }) => ({}));
export const StyledNewSection = styled('div')(({ theme }) => ({}));

export const StyledClubsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(0.5), // Necessary to include box shadow on club cards
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gridAutoRows: '1fr',
  '> a': {
    display: 'block',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    height: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    padding: 0,
  },
}));

export const StyledClubDetailsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledClubDetailsHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledHeaderTop = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    '> button': {
      width: '100%',
    },
  },
}));

export const StyledTagline = styled('i')(({ theme }) => ({}));
export const StyledDescription = styled('div')(({ theme }) => ({}));
export const StyledDescriptionContainer = styled('div')(({ theme }) => ({}));
export const StyledDescriptionTitle = styled('b')(({ theme }) => ({}));

export const StyledClubsPageTitle = styled(StyledPageTitle)(({ theme }) => ({
  marginBottom: 0,
}));

export const StyledClubDetailsContent = styled('div')(({ theme }) => ({}));
