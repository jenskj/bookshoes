import { alpha, styled } from '@mui/material/styles';

export const StyledHeaderShell = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  background:
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.92)} 0%, ${alpha(theme.palette.background.default, 0.86)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.84)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'light' ? 0.85 : 0.72)}`,
  boxShadow:
    theme.palette.mode === 'light'
      ? `0 8px 20px ${alpha('#1f1508', 0.08)}`
      : `0 10px 24px ${alpha('#000000', 0.28)}`,
}));

export const StyledHeaderInner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
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
