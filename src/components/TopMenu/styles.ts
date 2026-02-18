import { styled } from '@mui/material/styles';
import { UIButton } from '@components/ui';

export const StyledSignInButton = styled(UIButton)(({ theme }) => ({
  color: theme.palette.primary.light,
  background: 'rgba(197, 183, 88, 0.08)',
  padding: theme.spacing(0.6, 1.2),
  fontSize: '0.78rem',
  ':hover': {
    color: '#101115',
    backgroundColor: theme.palette.primary.main,
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
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.3, 0.5, 0.3, 0.3),
  cursor: 'pointer',
  transition: 'all 150ms ease',
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
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
  backgroundColor: '#111620',
  boxShadow: '0 20px 34px rgba(0, 0, 0, 0.42)',
  padding: theme.spacing(0.8),
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const StyledMenuName = styled('p')(({ theme }) => ({
  padding: theme.spacing(0.6, 0.7),
  color: theme.palette.text.secondary,
  fontSize: '0.82rem',
}));

export const StyledMenuAction = styled(UIButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'left',
  padding: theme.spacing(0.55, 0.7),
  ':hover': {
    color: theme.palette.primary.light,
  },
}));
