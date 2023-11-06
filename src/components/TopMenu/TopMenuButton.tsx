import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { deleteField } from 'firebase/firestore';
import { MouseEvent, useEffect, useState } from 'react';
import { auth } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { updateDocument } from '../../utils';

interface TopMenuButtonProps {
  onSignOut: () => void;
}

export const TopMenuButton = ({ onSignOut }: TopMenuButtonProps) => {
  const { activeClub } = useCurrentUserStore();

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onLeaveClub = () => {
    if (auth.currentUser?.uid) {
      updateDocument(
        'users',
        { activeClub: deleteField() },
        auth.currentUser?.uid
      );
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="User menu">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar
              alt={auth.currentUser?.displayName || 'Avatar'}
              src={auth.currentUser?.photoURL || ''}
            />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem onClick={handleCloseUserMenu}>
            <Typography onClick={onSignOut} textAlign="center">
              Sign Out
            </Typography>
          </MenuItem>
          {Boolean(activeClub) && (
            <MenuItem onClick={handleCloseUserMenu}>
              <Typography onClick={onLeaveClub} textAlign="center">
                Leave active club
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </>
  );
};
