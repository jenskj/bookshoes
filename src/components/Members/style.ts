import { Avatar, styled } from '@mui/material';

export const StyledMemberList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledMember = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const StyledLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

interface StyledNameProps {
  isCurrentUser: boolean;
}

export const StyledName = styled('div')<StyledNameProps>(
  ({ theme, isCurrentUser }) => ({
    color: isCurrentUser
      ? theme.palette.primary.main
      : theme.palette.text.primary,
    fontWeight: isCurrentUser ? 'bold' : 'normal',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 140,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  })
);

interface StyledOnlineStatusProps {
  isOnline: boolean;
}
export const StyledOnlineStatus = styled('span')<StyledOnlineStatusProps>(
  ({ theme, isOnline }) => ({
    color: isOnline
      ? theme.palette.secondary.light
      : theme.palette.text.secondary,
    fontSize: '0.75rem',
  })
);

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  border: `2px solid ${theme.palette.background.paper}`,
}));
