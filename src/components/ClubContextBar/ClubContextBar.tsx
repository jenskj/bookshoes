import { useCurrentUserStore } from '@hooks';
import { runOptimisticMutation } from '@lib/optimistic';
import { useToast } from '@lib/ToastContext';
import { Club } from '@types';
import { updateDocument } from '@utils';
import {
  StyledClubList,
  StyledClubOption,
  StyledClubSelect,
  StyledClubSelector,
  StyledContextActions,
  StyledContextBar,
  StyledContextHeading,
  StyledContextLink,
  StyledContextPrompt,
  StyledContextTitle,
  StyledContextTop,
  StyledCurrentClub,
  StyledGhostButton,
  StyledSelectorLabel,
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

    await runOptimisticMutation({
      getSnapshot: () => activeClub,
      apply: () => {
        const optimisticClub = computeOptimisticClubContext(activeClub, {
          type: 'select',
          club,
        });
        setActiveClub(optimisticClub);
      },
      commit: async () => {
        await updateDocument(
          'users',
          { activeClub: club.docId, active_club_id: club.docId },
          currentUser.docId
        );
      },
      rollback: (snapshot) => {
        setActiveClub(snapshot);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : String(error));
      },
    });
  };

  const onLeaveActiveClub = async () => {
    if (!currentUser?.docId) return;

    await runOptimisticMutation({
      getSnapshot: () => activeClub,
      apply: () => {
        const optimisticClub = computeOptimisticClubContext(activeClub, {
          type: 'leave',
        });
        setActiveClub(optimisticClub);
      },
      commit: async () => {
        await updateDocument(
          'users',
          { activeClub: null, active_club_id: null },
          currentUser.docId
        );
      },
      rollback: (snapshot) => {
        setActiveClub(snapshot);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : String(error));
      },
    });
  };

  const onChangeActiveClub = (clubId: string) => {
    const selectedClub = membershipClubs?.find((club) => club.docId === clubId);
    if (!selectedClub) return;
    void onSelectClub(selectedClub);
  };

  const activeClubName = activeClub?.data?.name ?? 'No active club selected';

  return (
    <StyledContextBar className="fade-up">
      <StyledContextTop>
        <StyledContextTitle>
          <StyledContextHeading>Club Context</StyledContextHeading>
          <StyledCurrentClub title={activeClubName}>{activeClubName}</StyledCurrentClub>
        </StyledContextTitle>
        <StyledContextActions>
          {activeClub ? (
            <StyledGhostButton
              type="button"
              onClick={onLeaveActiveClub}
              className="focus-ring"
            >
              Clear Active Club
            </StyledGhostButton>
          ) : null}
          <StyledGhostButton
            type="button"
            onClick={() => setClubContextCollapsed(!clubContextCollapsed)}
            className="focus-ring"
          >
            {clubContextCollapsed ? 'Show Club Switcher' : 'Hide Club Switcher'}
          </StyledGhostButton>
        </StyledContextActions>
      </StyledContextTop>

      {!clubContextCollapsed ? (
        membershipClubs?.length ? (
          <>
            <StyledClubSelector>
              <StyledSelectorLabel htmlFor="club-context-select">
                Switch active club
              </StyledSelectorLabel>
              <StyledClubSelect
                id="club-context-select"
                value={activeClub?.docId ?? ''}
                onChange={(event) => onChangeActiveClub(event.target.value)}
                className="focus-ring"
              >
                {!activeClub ? (
                  <option value="" disabled>
                    Choose a club
                  </option>
                ) : null}
                {membershipClubs.map((club) => (
                  <option key={club.docId} value={club.docId}>
                    {club.data.name}
                  </option>
                ))}
              </StyledClubSelect>
            </StyledClubSelector>
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
          </>
        ) : (
          <StyledContextPrompt>
            You have no clubs yet. Browse <StyledContextLink to="/clubs">clubs</StyledContextLink> to join one and unlock shared pace tracking.
          </StyledContextPrompt>
        )
      ) : null}
    </StyledContextBar>
  );
};
