import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, MouseEvent } from 'react';
import { auth } from '../../firestore';

interface TopMenuButtonProps {
  onSignOut: () => void;
}

export const TopMenuButton = ({onSignOut}: TopMenuButtonProps) => {
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
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
            <Typography onClick={onSignOut} textAlign="center">Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};
