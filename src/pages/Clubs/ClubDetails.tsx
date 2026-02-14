import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { Button } from '@mui/material';
import { ClubInfo, FirestoreClub, FirestoreMember, MemberInfo } from '@types';
import { addNewClubMember, deleteDocument, updateDocument } from '@utils';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StyledPageTitle } from '../styles';
import {
  StyledClubDetailsContainer,
  StyledClubDetailsContent,
  StyledClubDetailsHeader,
  StyledClubsPageTitle,
  StyledDescription,
  StyledDescriptionContainer,
  StyledDescriptionTitle,
  StyledHeaderTop,
  StyledTagline,
} from './styles';

export const ClubDetails = () => {
  const { id } = useParams();
  const { activeClub } = useCurrentUserStore();
  const [club, setClub] = useState<ClubInfo & { members?: FirestoreMember[] }>({ name: '', isPrivate: false });
  const [isMember, setIsMember] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    if (id) updateClub();
  }, [id]);

  const updateClub = async () => {
    if (!id) return;
    const { data: clubData } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (!clubData) return;

    const { data: membersData } = await supabase.from('club_members').select('*').eq('club_id', id);
    const membersList = membersData ?? [];
    const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
    const { data: usersData } = await supabase.from('users').select('id, display_name, photo_url').in('id', userIds);
    const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));

    const members: FirestoreMember[] = membersList.map((m: Record<string, unknown>) => {
      const u = usersMap.get(m.user_id as string) ?? {};
      return {
        docId: m.id as string,
        data: {
          uid: m.user_id as string,
          displayName: (u.display_name as string) ?? '',
          photoURL: (u.photo_url as string) ?? '',
          role: (m.role as MemberInfo['role']) ?? 'standard',
        } as MemberInfo,
      };
    });

    setClub({
      name: clubData.name,
      isPrivate: clubData.is_private ?? false,
      tagline: clubData.tagline,
      description: clubData.description,
      members,
    });
    setIsMember(members.some((m) => m.data.uid === userId));
  };

  const onLeaveClub = async () => {
    if (!id || !userId) return;
    const currentMember = club?.members?.find((m) => m.data.uid === userId);
    if (!currentMember) return;

    await deleteDocument(`clubs/${id}/members`, currentMember.docId);
    await updateDocument(
      'users',
      activeClub?.docId === id
        ? { activeClub: null, active_club_id: null, membershipsRemove: id }
        : { membershipsRemove: id },
      userId
    );
    updateClub();
  };

  const onJoinClub = async () => {
    if (!id) return;
    await addNewClubMember(id);
    updateClub();
  };

  return (
    <StyledClubDetailsContainer>
      <StyledClubDetailsHeader>
        <StyledHeaderTop>
          <StyledClubsPageTitle>{club?.name}</StyledClubsPageTitle>
          <Button
            variant="contained"
            onClick={isMember ? onLeaveClub : onJoinClub}
          >
            {`${isMember ? 'Leave' : 'Join'} club`}
          </Button>
        </StyledHeaderTop>
        {club.tagline ? <StyledTagline>{club.tagline}</StyledTagline> : null}
      </StyledClubDetailsHeader>
      <StyledClubDetailsContent>
        {club.description ? (
          <StyledDescriptionContainer>
            <StyledDescriptionTitle>Description:</StyledDescriptionTitle>
            <StyledDescription>{club.description}</StyledDescription>
          </StyledDescriptionContainer>
        ) : null}
      </StyledClubDetailsContent>
      <StyledPageTitle>Members</StyledPageTitle>
      Coming soon...
    </StyledClubDetailsContainer>
  );
};
