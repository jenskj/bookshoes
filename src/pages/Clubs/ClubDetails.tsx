import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import { mapMemberRow } from '@lib/mappers';
import { UIButton } from '@components/ui';
import { useCurrentUserStore } from '@hooks';
import { ClubInfo, Member } from '@types';
import { addNewClubMember, deleteMember, updateDocument } from '@utils';
import { useCallback, useEffect, useState } from 'react';
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
  const { showError, showSuccess } = useToast();
  const { activeClub } = useCurrentUserStore();
  const [club, setClub] = useState<ClubInfo & { members?: Member[] }>({ name: '', isPrivate: false });
  const [isMember, setIsMember] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  const updateClub = useCallback(async () => {
    if (!id) return;
    const { data: clubData } = await supabase.from('clubs').select('*').eq('id', id).single();
    if (!clubData) return;

    const { data: membersData } = await supabase.from('club_members').select('*').eq('club_id', id);
    const membersList = membersData ?? [];
    const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
    const { data: usersData } = await supabase.from('users').select('id, display_name, photo_url').in('id', userIds);
    const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));

    const members: Member[] = membersList.map((m: Record<string, unknown>) => {
      const u = usersMap.get(m.user_id as string) ?? {};
      return mapMemberRow(m, { user_id: m.user_id, display_name: u.display_name, photo_url: u.photo_url });
    });

    setClub({
      name: clubData.name,
      isPrivate: clubData.is_private ?? false,
      tagline: clubData.tagline ?? undefined,
      description: clubData.description ?? undefined,
      members,
    });
    setIsMember(members.some((m) => m.data.uid === userId));
  }, [id, userId]);

  useEffect(() => {
    if (id) {
      void updateClub();
    }
  }, [id, updateClub]);

  const onLeaveClub = async () => {
    if (!id || !userId) return;
    const currentMember = club?.members?.find((m) => m.data.uid === userId);
    if (!currentMember) return;

    try {
      await deleteMember(id, currentMember.docId);
      await updateDocument(
        'users',
        activeClub?.docId === id
          ? { activeClub: null, active_club_id: null, membershipsRemove: id }
          : { membershipsRemove: id },
        userId
      );
      showSuccess('Left club');
      void updateClub();
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  };

  const onJoinClub = async () => {
    if (!id) return;
    try {
      await addNewClubMember(id);
      showSuccess('Joined club');
      void updateClub();
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <StyledClubDetailsContainer>
      <StyledClubDetailsHeader>
        <StyledHeaderTop>
          <StyledClubsPageTitle>{club?.name}</StyledClubsPageTitle>
          <UIButton
            variant={isMember ? 'danger' : 'primary'}
            onClick={isMember ? onLeaveClub : onJoinClub}
            className="focus-ring"
          >
            {`${isMember ? 'Leave' : 'Join'} club`}
          </UIButton>
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
