import { useCurrentUserStore } from '@hooks';
import { useToast } from '@lib/ToastContext';
import { Club } from '@types';
import { updateDocument } from '@utils';
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
import {
  computeOptimisticClubContext,
  shouldSwitchClub,
} from './contextUtils';

export const ClubContextBar = () => {
  const { showError } = useToast();
  const {
    activeClub,
    membershipClubs,
    currentUser,
    setActiveClub,
    clubContextCollapsed,
    setClubContextCollapsed,
  } = useCurrentUserStore();

  const onSelectClub = async (club: Club) => {
    if (!currentUser?.docId) return;
    if (!shouldSwitchClub(activeClub?.docId, club.docId)) return;
    const previousClub = activeClub;
    const optimistic = computeOptimisticClubContext(previousClub, {
      type: 'select',
      club,
    });
    setActiveClub(optimistic);

    try {
      await updateDocument(
        'users',
        { activeClub: club.docId, active_club_id: club.docId },
        currentUser.docId
      );
    } catch (error) {
      setActiveClub(previousClub);
      showError(error instanceof Error ? error.message : String(error));
    }
  };

  const onLeaveActiveClub = async () => {
    if (!currentUser?.docId) return;
    const previousClub = activeClub;
    const optimistic = computeOptimisticClubContext(previousClub, {
      type: 'leave',
    });
    setActiveClub(optimistic);
    try {
      await updateDocument(
        'users',
        { activeClub: null, active_club_id: null },
        currentUser.docId
      );
    } catch (error) {
      setActiveClub(previousClub);
      showError(error instanceof Error ? error.message : String(error));
    }
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
            You have no clubs yet. Browse <StyledContextLink to="/clubs">clubs</StyledContextLink> to join one and unlock shared pace tracking.
          </StyledContextPrompt>
        )
      ) : null}
    </StyledContextBar>
  );
};
