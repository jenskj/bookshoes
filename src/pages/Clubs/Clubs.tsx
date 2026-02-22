import { Club, ClubForm, SwiperNavigationButtons, UIButton } from '@components';
import { supabase } from '@lib/supabase';
import { mapClubRow } from '@lib/mappers';
import { useCurrentUserStore } from '@hooks';
import type { Club as ClubType } from '@types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  StyledClubs,
  StyledClubsContainer,
  StyledClubsHeaderHint,
  StyledClubsHeaderActions,
  StyledClubsHeaderTitle,
} from './styles';

const EMPTY_MEMBERSHIP_IDS: string[] = [];
const EMPTY_MEMBERSHIP_CLUBS: ClubType[] = [];

const sortClubsByName = (nextClubs: ClubType[]) =>
  [...nextClubs].sort((a, b) => a.data.name.localeCompare(b.data.name));

export const Clubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const membershipIds = useCurrentUserStore(
    (state) => state.currentUser?.data.memberships ?? EMPTY_MEMBERSHIP_IDS
  );
  const membershipClubs = useCurrentUserStore(
    (state) => state.membershipClubs ?? EMPTY_MEMBERSHIP_CLUBS
  );
  const membershipRolesByClubId = useCurrentUserStore(
    (state) => state.membershipRolesByClubId
  );
  const membershipSet = useMemo(() => new Set(membershipIds), [membershipIds]);
  // Prefer store's membership clubs for "Your clubs" (loaded in App with session); fallback to filtering full list.
  const yourClubs = useMemo(
    () => (membershipClubs.length ? membershipClubs : clubs.filter((club) => membershipSet.has(club.docId))),
    [clubs, membershipClubs, membershipSet]
  );
  const otherClubs = useMemo(
    () => clubs.filter((club) => !membershipSet.has(club.docId)),
    [clubs, membershipSet]
  );
  const visibleClubs = activeIndex === 0 ? yourClubs : otherClubs;

  const fetchClubs = useCallback(async () => {
    const { data } = await supabase.from('clubs').select('*');
    setClubs(sortClubsByName((data ?? []).map((club) => mapClubRow(club))));
  }, []);

  const fetchMemberCounts = useCallback(async () => {
    const { data } = await supabase.from('club_members').select('club_id');
    const counts = (data ?? []).reduce<Record<string, number>>((nextCounts, row) => {
      if (!row.club_id) return nextCounts;
      nextCounts[row.club_id] = (nextCounts[row.club_id] ?? 0) + 1;
      return nextCounts;
    }, {});
    setMemberCounts(counts);
  }, []);

  useEffect(() => {
    const clubsChannel = supabase
      .channel('clubs-page-clubs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clubs' }, () => {
        void fetchClubs();
      })
      .subscribe();

    const clubMembersChannel = supabase
      .channel('clubs-page-club-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_members' }, () => {
        void fetchMemberCounts();
      })
      .subscribe();

    void Promise.all([fetchClubs(), fetchMemberCounts()]);

    return () => {
      supabase.removeChannel(clubsChannel);
      supabase.removeChannel(clubMembersChannel);
    };
  }, [fetchClubs, fetchMemberCounts]);

  return (
    <StyledClubs>
      <StyledClubsHeaderActions>
        <div>
          <StyledClubsHeaderTitle>Start Your Own Club</StyledClubsHeaderTitle>
          <StyledClubsHeaderHint>
            Create a new circle, invite readers, and set your first discussion pace.
          </StyledClubsHeaderHint>
        </div>
        <UIButton
          variant="primary"
          className="focus-ring"
          onClick={() => setCreateClubOpen(true)}
        >
          Create Club
        </UIButton>
      </StyledClubsHeaderActions>
      <SwiperNavigationButtons
        onSwipe={(index) => setActiveIndex(index)}
        activeIndex={activeIndex}
        slides={[{ title: 'Your clubs' }, { title: 'Find new clubs' }]}
      />
      <StyledClubsContainer>
        {visibleClubs.map((club) => (
          <Link key={club.docId} to={`/clubs/${club.docId}`}>
            <Club
              club={club}
              memberCount={memberCounts[club.docId] ?? 0}
              currentUserRole={membershipRolesByClubId[club.docId]}
            />
          </Link>
        ))}
      </StyledClubsContainer>
      <ClubForm
        isOpen={createClubOpen}
        onClose={() => setCreateClubOpen(false)}
        onCreated={(clubId) => {
          setCreateClubOpen(false);
          navigate(`/clubs/${clubId}/admin`);
        }}
      />
    </StyledClubs>
  );
};
