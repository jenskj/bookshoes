import { supabase } from '@lib/supabase';
import { Club as ClubType, Member } from '@types';
import { mapMemberRow } from '@lib/mappers';
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
  club: ClubType;
}

export const Club = ({
  club: {
    docId,
    data: { name, tagline },
  },
}: ClubProps) => {
  const [members, setMembers] = useState<Member[] | null>(null);

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
        const userIds = membersList.map((member) => member.user_id);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name, photo_url')
          .in('id', userIds);
        const usersMap = new Map((usersData ?? []).map((user) => [user.id, user]));
        const mapped = membersList.map((member) => {
          const user = usersMap.get(member.user_id) ?? undefined;
          return mapMemberRow(member, {
            user_id: member.user_id,
            display_name: user?.display_name,
            photo_url: user?.photo_url,
          });
        });
        setMembers(mapped);
      });
  }, [docId]);

  return (
    <StyledClubCard>
      <StyledTop>
        <StyledClubName>{name}</StyledClubName>
        {tagline ? <StyledText>{tagline}</StyledText> : null}
      </StyledTop>
      <StyledMiddle>
        <StyledText>Club reading focus appears on the dashboard.</StyledText>
      </StyledMiddle>
      <StyledBottom>
        <StyledMembersInfo>Active members: {members?.length ?? 0}</StyledMembersInfo>
        <StyledCTA variant="ghost">Join this club</StyledCTA>
      </StyledBottom>
    </StyledClubCard>
  );
};
