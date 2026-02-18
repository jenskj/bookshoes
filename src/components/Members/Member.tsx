import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { MemberInfo } from '@types';
import { formatDate } from '@utils';
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
  const dateTimeSettings = useCurrentUserStore((state) => state.settings.dateTime);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
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
        .maybeSingle()
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
        <div>
          <StyledAvatar
            sx={{ width: 32, height: 32 }}
            alt={displayName || 'Avatar'}
            src={photoURL || ''}
          />
        </div>
        <StyledName isCurrentUser={isCurrentUser || false}>
          {displayName}
        </StyledName>
      </StyledLeft>
      <div>
        {!isCurrentUser ? (
          <StyledOnlineStatus isOnline={isOnline}>
            {isOnline
              ? '● Currently online'
              : lastOnline &&
                `Last online: ${formatDate(lastOnline, false, dateTimeSettings)}`}
          </StyledOnlineStatus>
        ) : null}
      </div>
    </StyledMember>
  );
};
