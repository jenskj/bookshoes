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
  const currentUserId = useCurrentUserStore((state) => state.currentUser?.docId);
  const presence = useCurrentUserStore((state) => state.presenceByUserId[uid]);
  const isCurrentUser = currentUserId === uid;
  const isOnline = presence?.isOnline ?? false;
  const lastOnline = presence?.lastOnlineAt ?? '';

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
        <StyledName isCurrentUser={isCurrentUser}>
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
