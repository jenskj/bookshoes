import { useCurrentUserStore } from '@hooks';
import { Club } from '@types';
import { updateDocument } from '@utils';
import { Link } from 'react-router-dom';
import {
  StyledClubList,
  StyledClubOption,
  StyledContextActions,
  StyledContextBar,
  StyledContextHeading,
  StyledContextLink,
  StyledContextPrompt,
  StyledContextTitle,
  StyledContextTop,
  StyledCurrentClub,
  StyledGhostButton,
} from './styles';

export const ClubContextBar = () => {
  const {
    activeClub,
    membershipClubs,
    currentUser,
    setActiveClub,
    clubContextCollapsed,
    setClubContextCollapsed,
  } = useCurrentUserStore();

  const onSelectClub = (club: Club) => {
    if (!currentUser?.docId || activeClub?.docId === club.docId) return;
    setActiveClub(club);
    updateDocument(
      'users',
      { activeClub: club.docId, active_club_id: club.docId },
      currentUser.docId
    ).catch(() => {});
  };

  const onLeaveActiveClub = () => {
    if (!currentUser?.docId) return;
    setActiveClub(undefined);
    updateDocument(
      'users',
      { activeClub: null, active_club_id: null },
      currentUser.docId
    ).catch(() => {});
  };

  return (
    <StyledContextBar className="fade-up">
      <StyledContextTop>
        <StyledContextTitle>
          <StyledContextHeading>Club Context</StyledContextHeading>
          <StyledCurrentClub>
            {activeClub?.data?.name ?? 'No active club selected'}
          </StyledCurrentClub>
        </StyledContextTitle>
        <StyledContextActions>
          {activeClub ? (
            <StyledGhostButton
              type="button"
              onClick={onLeaveActiveClub}
              className="focus-ring"
            >
              Leave Active Club
            </StyledGhostButton>
          ) : null}
          <StyledGhostButton
            type="button"
            onClick={() => setClubContextCollapsed(!clubContextCollapsed)}
            className="focus-ring"
          >
            {clubContextCollapsed ? 'Expand' : 'Collapse'}
          </StyledGhostButton>
        </StyledContextActions>
      </StyledContextTop>

      {!clubContextCollapsed ? (
        membershipClubs?.length ? (
          <StyledClubList>
            {membershipClubs.map((club) => (
              <StyledClubOption
                key={club.docId}
                type="button"
                className="focus-ring"
                isActive={activeClub?.docId === club.docId}
                onClick={() => onSelectClub(club)}
              >
                {club.data.name}
              </StyledClubOption>
            ))}
          </StyledClubList>
        ) : (
          <StyledContextPrompt>
            You have no clubs yet. Browse <StyledContextLink as={Link} to="/clubs">clubs</StyledContextLink> to join one and unlock shared pace tracking.
          </StyledContextPrompt>
        )
      ) : null}
    </StyledContextBar>
  );
};
