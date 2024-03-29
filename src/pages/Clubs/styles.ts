import { styled } from '@mui/material';
import { StyledPageTitle } from '../styles';

export const StyledMemberSection = styled('div')(({ theme }) => ({}));
export const StyledNewSection = styled('div')(({ theme }) => ({}));

export const StyledClubsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(0.5), // Necessary to include box shadow on club cards
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridAutoRows: 'minmax(520px, 1fr)',
  [theme.breakpoints.down('md')]: {
    gridAutoRows: 'minmax(520px, 1fr)',
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const StyledTagline = styled('i')(({ theme }) => ({}));
export const StyledDescription = styled('div')(({ theme }) => ({}));
export const StyledDescriptionContainer = styled('div')(({ theme }) => ({}));
export const StyledDescriptionTitle = styled('b')(({ theme }) => ({}));

export const StyledClubsPageTitle = styled(StyledPageTitle)(({ theme }) => ({
  marginBottom: 0,
}));

export const StyledClubDetailsContent = styled('div')(({ theme }) => ({}));
