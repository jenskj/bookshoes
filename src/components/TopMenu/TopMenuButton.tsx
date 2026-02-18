import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { useNavigate } from 'react-router-dom';
import {
  StyledAvatar,
  StyledFallbackAvatar,
  StyledMenuAction,
  StyledMenuButton,
  StyledMenuName,
  StyledMenuPanel,
  StyledMenuShell,
} from './styles';

const initialsFromName = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

export const TopMenuButton = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const setActiveClub = useCurrentUserStore((state) => state.setActiveClub);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onOutsideClick);
    return () => window.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const initials = useMemo(
    () => initialsFromName(currentUser?.data.displayName),
    [currentUser?.data.displayName]
  );

  const onSignOut = () => {
    setCurrentUser(undefined);
    setActiveClub(undefined);
    setOpen(false);
    supabase.auth.signOut().catch(() => {});
  };

  return (
    <StyledMenuShell ref={containerRef}>
      <StyledMenuButton
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="focus-ring"
        aria-expanded={open}
        aria-label="Open account menu"
      >
        {currentUser?.data.photoURL ? (
          <StyledAvatar
            src={currentUser.data.photoURL}
            alt={currentUser.data.displayName || 'Profile photo'}
          />
        ) : (
          <StyledFallbackAvatar>{initials}</StyledFallbackAvatar>
        )}
        Account
      </StyledMenuButton>
      {open ? (
        <StyledMenuPanel>
          <StyledMenuName>{currentUser?.data.displayName || 'Signed in'}</StyledMenuName>
          <StyledMenuAction
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/settings');
            }}
            className="focus-ring"
          >
            Settings
          </StyledMenuAction>
          <StyledMenuAction
            type="button"
            onClick={onSignOut}
            className="focus-ring"
          >
            Sign out
          </StyledMenuAction>
        </StyledMenuPanel>
      ) : null}
    </StyledMenuShell>
  );
};
