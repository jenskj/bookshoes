import { styled } from '@mui/material/styles';

export const StyledHeaderShell = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  backgroundColor: 'rgba(12, 15, 22, 0.92)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledHeaderInner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.25, 2),
}));

export const StyledLogoBlock = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.15),
}));

export const StyledWordmark = styled('h1')(({ theme }) => ({
  margin: 0,
  fontSize: '1.12rem',
  lineHeight: 1.1,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.palette.text.primary,
}));

export const StyledTagline = styled('span')(({ theme }) => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.68rem',
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: theme.palette.primary.main,
}));
