import { Logout } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { deleteField } from 'firebase/firestore';
import { MouseEvent, useState } from 'react';
import { auth, firestore } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { FirestoreClub } from '../../types';
import { updateDocument } from '../../utils';
import DoorBackIcon from '@mui/icons-material/DoorBack';

export const TopMenuButton = () => {
  const { activeClub, setActiveClub, setCurrentUser, membershipClubs } =
    useCurrentUserStore();

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const onSignOut = () => {
    auth.signOut().then(() => {
      setCurrentUser(undefined);
      setActiveClub(undefined);
    });
  };

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

  const onSelectNewActiveClub = (club: FirestoreClub) => {
    if (auth.currentUser?.uid) {
      updateDocument(
        'users',
        { activeClub: firestore.doc('clubs/' + club.docId) },
        auth.currentUser?.uid
      ).then(() => setActiveClub(club));
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="User menu">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar
              sx={{ width: 32, height: 32 }}
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
          <div onClick={handleCloseUserMenu}>
            <MenuItem onClick={onSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <Typography textAlign="center">Sign Out</Typography>
            </MenuItem>
          </div>
          <Divider />
          <MenuItem disabled sx={{ paddingBottom: 0, textAlign: 'center' }}>
            <Typography
              variant="caption"
              align="center"
              sx={{ textTransform: 'uppercase' }}
            >
              My clubs
            </Typography>
          </MenuItem>
          {membershipClubs &&
            membershipClubs.map((club) => (
              <div key={club.docId} onClick={handleCloseUserMenu}>
                <MenuItem
                  selected={activeClub?.docId === club.docId}
                  onClick={() => onSelectNewActiveClub(club)}
                >
                  <Typography textAlign="center">{club.data.name}</Typography>
                </MenuItem>
              </div>
            ))}
          <div onClick={handleCloseUserMenu}>
            <MenuItem onClick={onLeaveClub}>
              <ListItemIcon>
                <DoorBackIcon fontSize="small" />
              </ListItemIcon>
              <Typography textAlign="center">Leave active club</Typography>
            </MenuItem>
          </div>
        </Menu>
      </Box>
    </>
  );
};
