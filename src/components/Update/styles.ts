import { styled } from '@mui/material';

export const StyledUpdateContainer = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(4)} ${theme.spacing(2)}`,
  position: 'relative',

  '::after': {
    content: '""',
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    transition: 'opacity 300ms ease-in-out',
  },

  ':hover': {
    '::after': {
      opacity: 1,
    },
  },
}));

export const StyledUpdate = styled('div')(({ theme }) => ({
  cursor: 'default',
  position: 'relative',
  zIndex: 1,
}));

export const StyledBulletContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledBullet = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(2),
  zIndex: 1,
  position: 'relative',
  '::before': {
    content: '"• "',
    position: 'absolute',
    left: theme.spacing(-2),
  },
}));

export const StyledDate = styled('div')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(1),
}));
