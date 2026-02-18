import { UICard } from '@components/ui';
import { styled } from '@mui/material/styles';
import { StyledPage, StyledPageTitle } from '@pages/styles';

export const StyledSettingsPage = styled(StyledPage)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledSettingsTitle = styled(StyledPageTitle)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const StyledSettingsGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const StyledSettingsCard = styled(UICard)(({ theme }) => ({
  padding: theme.spacing(1.25),
  display: 'grid',
  gap: theme.spacing(1),
  alignContent: 'start',
}));

export const StyledSettingsHeading = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  fontSize: '1.02rem',
}));

export const StyledSettingsHint = styled('p')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.84rem',
}));

export const StyledFormRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledActionBar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingBottom: theme.spacing(6),
}));
