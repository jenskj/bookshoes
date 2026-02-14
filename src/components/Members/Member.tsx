import { IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { MemberInfo } from '@types';
import {
  StyledAvatar,
  StyledLeft,
  StyledMember,
  StyledName,
  StyledOnlineStatus,
} from './style';

interface MemberProps {
  memberInfo: MemberInfo;
}

export const Member = ({
  memberInfo: { displayName, photoURL, uid },
}: MemberProps) => {
  const [isCurrentUser, setIsCurrentUser] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
      setIsCurrentUser(user?.id === uid);
    });
  }, [uid]);

  useEffect(() => {
    if (uid && isCurrentUser === false) {
      const channel = supabase
        .channel(`presence-${uid}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_presence', filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            if (row?.last_online_at) {
              const last = new Date(row.last_online_at as string);
              const now = new Date();
              setIsOnline(now.getTime() - last.getTime() < 60000);
              setLastOnline((row.last_online_at as string) ?? '');
            }
          }
        )
        .subscribe();

      supabase
        .from('user_presence')
        .select('last_online_at')
        .eq('user_id', uid)
        .single()
        .then(({ data }) => {
          if (data?.last_online_at) {
            const last = new Date(data.last_online_at as string);
            const now = new Date();
            setIsOnline(now.getTime() - last.getTime() < 60000);
            setLastOnline(data.last_online_at as string);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isCurrentUser, uid]);

  return (
    <StyledMember>
      <StyledLeft>
        <IconButton sx={{ p: 0 }}>
          <StyledAvatar
            sx={{ width: 32, height: 32 }}
            alt={displayName || 'Avatar'}
            src={photoURL || ''}
          />
        </IconButton>
        <StyledName isCurrentUser={isCurrentUser || false}>
          {displayName}
        </StyledName>
      </StyledLeft>
      <div>
        {!isCurrentUser ? (
          <StyledOnlineStatus isOnline={isOnline}>
            {isOnline
              ? '● Currently online'
              : lastOnline && `Last online: ${new Date(lastOnline).toLocaleDateString('da-DK')}`}
          </StyledOnlineStatus>
        ) : null}
      </div>
    </StyledMember>
  );
};
