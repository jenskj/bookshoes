import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { Logout } from '@mui/icons-material';
import DoorBackIcon from '@mui/icons-material/DoorBack';
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
import { FirestoreClub } from '@types';
import { updateDocument } from '@utils';
import { MouseEvent, useState, useEffect } from 'react';

export const TopMenuButton = () => {
  const { activeClub, setActiveClub, setCurrentUser, membershipClubs } =
    useCurrentUserStore();
  const [user, setUser] = useState<{ displayName?: string; photoURL?: string; id?: string } | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? { displayName: u.user_metadata?.full_name, photoURL: u.user_metadata?.avatar_url, id: u.id } : null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { displayName: session.user.user_metadata?.full_name, photoURL: session.user.user_metadata?.avatar_url, id: session.user.id } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const onSignOut = () => {
    supabase.auth.signOut().then(() => {
      setCurrentUser(undefined);
      setActiveClub(undefined);
    });
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onLeaveClub = () => {
    if (user?.id) {
      updateDocument('users', { activeClub: null, active_club_id: null }, user.id);
    }
  };

  const onSelectNewActiveClub = (club: FirestoreClub) => {
    if (user?.id) {
      updateDocument('users', { activeClub: club.docId, active_club_id: club.docId }, user.id).then(() =>
        setActiveClub(club)
      );
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="User menu">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar
              sx={{ width: 32, height: 32 }}
              alt={user?.displayName || 'Avatar'}
              src={user?.photoURL || ''}
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
