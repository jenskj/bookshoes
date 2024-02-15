import { IconButton } from '@mui/material';
import { getDatabase, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { auth } from '../../firestore';
import { MemberInfo } from '../../types';
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
  const [lastOnline, setLastOnline] = useState('');

  useEffect(() => {
    if (uid && isCurrentUser === false) {
      // Check if the user is online
      const database = getDatabase();
      const myConnectionsRef = ref(database, `users/${uid}/connections`);

      // stores the timestamp of my last disconnect (the last time I was seen online)
      const lastOnlineRef = ref(database, `users/${uid}/lastOnline`);
      onValue(myConnectionsRef, (snapshot) => {
        // If the user is online, show the online status
        if (snapshot.val()) {
          setIsOnline(true);
        } else {
          // If the user is offline, show the last time they were online
          onValue(lastOnlineRef, (snapshot) => {
            setLastOnline(snapshot.val());
          });
        }
      });
    }
    // To do: check if the user is the user connected with the app right now?
  }, [isCurrentUser, uid]);

  useEffect(() => {
    setIsCurrentUser(auth.currentUser?.uid === uid);
  }, [uid]);

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
              : lastOnline && `Last online: ${new Date(
                  parseInt(lastOnline)
                ).toLocaleDateString('da-DK')}`}
          </StyledOnlineStatus>
        ) : null}
      </div>
    </StyledMember>
  );
};
