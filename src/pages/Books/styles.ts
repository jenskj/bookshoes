import { styled } from '@mui/material/styles';
import { StyledPageSection } from '@pages/styles';

export const StyledBookDetailsPage = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

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
      alignItems: 'start',
    },
  })
);

export const StyledBookMetadataPanel = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledMetadataGrid = styled('dl')(({ theme }) => ({
  margin: 0,
  display: 'grid',
  gap: theme.spacing(0.85),
}));

export const StyledMetadataRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '130px 1fr',
  gap: theme.spacing(1),
  alignItems: 'start',
  dt: {
    margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
  dd: {
    margin: 0,
    color: theme.palette.text.primary,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
}));

export const StyledDescriptionSection = styled(StyledPageSection)(({ theme }) => ({
  p: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.55,
    color: theme.palette.text.primary,
  },
}));

export const StyledBookMissingState = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.secondary,
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}));
