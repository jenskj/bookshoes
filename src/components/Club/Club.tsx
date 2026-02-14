import { BookCover } from '@components/Book';
import { supabase } from '@lib/supabase';
import { FirestoreBook, FirestoreClub, FirestoreMember } from '@types';
import { useEffect, useState } from 'react';
import {
  StyledBottom,
  StyledCTA,
  StyledClubCard,
  StyledClubName,
  StyledMembersInfo,
  StyledMiddle,
  StyledText,
  StyledTop,
} from './styles';

interface ClubProps {
  club: FirestoreClub;
}

export const Club = ({
  club: {
    docId,
    data: { name, isPrivate, tagline, description },
  },
}: ClubProps) => {
  const [members, setMembers] = useState<FirestoreMember[] | null>(null);
  const [currentlyReading, setCurrentlyReading] =
    useState<FirestoreBook | null>(null);

  useEffect(() => {
    if (!docId) return;
    supabase
      .from('club_members')
      .select('*')
      .eq('club_id', docId)
      .then(async ({ data: membersData }) => {
        const membersList = membersData ?? [];
        if (membersList.length === 0) {
          setMembers([]);
          return;
        }
        const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
        const { data: usersData } = await supabase.from('users').select('id, display_name, photo_url').in('id', userIds);
        const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));
        const mapped = membersList.map((m: Record<string, unknown>) => {
          const u = usersMap.get(m.user_id as string) ?? {};
          return {
            docId: m.id,
            data: {
              uid: m.user_id,
              displayName: (u.display_name as string) ?? '',
              photoURL: (u.photo_url as string) ?? '',
              role: (m.role as string) ?? 'standard',
            },
          } as FirestoreMember;
        });
        setMembers(mapped);
      });
  }, [docId]);

  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
        {tagline ? <StyledText variant="caption">{tagline}</StyledText> : null}
      </StyledTop>
      <StyledMiddle>
        {currentlyReading ? (
          <>
            <StyledText>Currently reading:</StyledText>
            <BookCover bookInfo={currentlyReading.data} />
            <StyledText variant="body2">
              {currentlyReading.data.volumeInfo?.title} by{' '}
              {currentlyReading.data.volumeInfo?.authors?.join(', ')}
            </StyledText>
          </>
        ) : null}
      </StyledMiddle>
      <StyledBottom>
        <StyledMembersInfo>Active members: {members?.length ?? 0}</StyledMembersInfo>
        <StyledCTA variant="outlined">Join this club</StyledCTA>
      </StyledBottom>
    </StyledClubCard>
  );
};
