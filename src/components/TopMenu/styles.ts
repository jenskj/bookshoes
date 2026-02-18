import { alpha, styled } from '@mui/material/styles';
import { UIButton } from '@components/ui';

export const StyledSignInButton = styled(UIButton)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
  background: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.14 : 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.32 : 0.24)}`,
  padding: theme.spacing(0.6, 1.2),
  fontSize: '0.78rem',
  ':hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
}));

export const StyledMenuShell = styled('div')(({ theme }) => ({
  position: 'relative',
}));

export const StyledMenuButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.8),
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(
    theme.palette.background.paper,
    theme.palette.mode === 'light' ? 0.78 : 0.2
  ),
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.3, 0.5, 0.3, 0.3),
  cursor: 'pointer',
  transition: 'all 150ms ease',
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    backgroundColor: alpha(
      theme.palette.background.paper,
      theme.palette.mode === 'light' ? 0.95 : 0.32
    ),
  },
}));

export const StyledAvatar = styled('img')(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  objectFit: 'cover',
  border: `1px solid ${theme.palette.primary.main}`,
}));

export const StyledFallbackAvatar = styled('div')(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: '0.72rem',
  color: theme.palette.background.default,
  backgroundColor: theme.palette.primary.main,
}));

export const StyledMenuPanel = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 8px)',
  minWidth: 200,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  background:
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.96)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.94)} 100%)`,
  boxShadow:
    theme.palette.mode === 'light'
      ? `0 18px 30px ${alpha('#1f1508', 0.16)}`
      : `0 20px 34px ${alpha('#000000', 0.42)}`,
  padding: theme.spacing(0.8),
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const StyledMenuName = styled('p')(({ theme }) => ({
  padding: theme.spacing(0.6, 0.7),
  color: theme.palette.text.primary,
  fontSize: '0.82rem',
}));

export const StyledMenuAction = styled(UIButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'left',
  padding: theme.spacing(0.55, 0.7),
  ':hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));
