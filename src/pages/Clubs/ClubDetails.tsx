import { UIButton } from '@components/ui';
import {
  canActorChangeMemberRole,
  canActorRemoveMember,
  roleDisplayName,
} from '@lib/clubPermissions';
import { formatClubTitleWithRole } from '@lib/clubRoleLabels';
import { UserRole } from '@types';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  StyledActionRow,
  StyledClubDetailsContainer,
  StyledClubDetailsHeader,
  StyledClubsPageTitle,
  StyledHeaderTop,
  StyledInviteCode,
  StyledMemberList,
  StyledMemberMeta,
  StyledMemberRole,
  StyledMemberRow,
  StyledMuted,
  StyledRequestList,
  StyledRequestRow,
  StyledSectionCard,
  StyledSectionTitle,
} from './styles';
import { useClubDetailsState } from './useClubDetailsState';

export const ClubDetails = () => {
  const navigate = useNavigate();
  const {
    id,
    club,
    members,
    loading,
    busyAction,
    profileDraft,
    joinMessage,
    inviteMaxUses,
    inviteExpiresInDays,
    pendingRequests,
    latestOwnRequest,
    effectiveJoinMode,
    canDirectJoin,
    canRequestJoin,
    invites,
    permissions,
    userId,
    setProfileDraft,
    setJoinMessage,
    setInviteMaxUses,
    setInviteExpiresInDays,
    onJoinClub,
    onLeaveClub,
    onRequestJoin,
    onSaveProfile,
    onCreateInvite,
    onRevokeInvite,
    onCopyInvite,
    onReviewRequest,
    onChangeMemberRole,
    onRemoveMember,
  } = useClubDetailsState();

  return (
    <StyledClubDetailsContainer>
      <StyledClubDetailsHeader>
        <StyledHeaderTop>
          <StyledClubsPageTitle>
            {formatClubTitleWithRole(club?.data.name ?? 'Club', permissions.role)}
          </StyledClubsPageTitle>
          <StyledActionRow>
            {permissions.canEditClubProfile ? (
              <UIButton
                variant="ghost"
                onClick={() => navigate(`/clubs/${id}/admin`)}
                className="focus-ring"
              >
                Open Admin
              </UIButton>
            ) : null}
            {permissions.isMember ? (
              <UIButton
                variant="danger"
                onClick={onLeaveClub}
                className="focus-ring"
                disabled={busyAction === 'leave'}
              >
                {busyAction === 'leave' ? 'Leaving...' : 'Leave club'}
              </UIButton>
            ) : canDirectJoin ? (
              <UIButton
                variant="primary"
                onClick={onJoinClub}
                className="focus-ring"
                disabled={busyAction === 'join'}
              >
                {busyAction === 'join' ? 'Joining...' : 'Join club'}
              </UIButton>
            ) : null}
          </StyledActionRow>
        </StyledHeaderTop>
        {club?.data.tagline ? <i>{club.data.tagline}</i> : null}
      </StyledClubDetailsHeader>

      <div>
        <StyledSectionCard>
          <StyledSectionTitle>Club Profile</StyledSectionTitle>
          {permissions.canEditClubProfile ? (
            <>
              <TextField
                label="Club name"
                value={profileDraft.name}
                onChange={(event) =>
                  setProfileDraft((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
              />
              <TextField
                label="Tagline"
                value={profileDraft.tagline ?? ''}
                onChange={(event) =>
                  setProfileDraft((previous) => ({
                    ...previous,
                    tagline: event.target.value,
                  }))
                }
              />
              <TextField
                label="Description"
                multiline
                minRows={3}
                value={profileDraft.description ?? ''}
                onChange={(event) =>
                  setProfileDraft((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
              />
              <FormControl size="small">
                <InputLabel id="club-privacy-label">Visibility</InputLabel>
                <Select
                  labelId="club-privacy-label"
                  label="Visibility"
                  value={profileDraft.isPrivate ? 'private' : 'public'}
                  onChange={(event) =>
                    setProfileDraft((previous) => ({
                      ...previous,
                      isPrivate: event.target.value === 'private',
                    }))
                  }
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              <StyledActionRow>
                <UIButton
                  variant="primary"
                  className="focus-ring"
                  onClick={onSaveProfile}
                  disabled={busyAction === 'save-profile'}
                >
                  {busyAction === 'save-profile' ? 'Saving...' : 'Save profile'}
                </UIButton>
              </StyledActionRow>
            </>
          ) : (
            <>
              {club?.data.description ? (
                <div>
                  <b>Description:</b>
                  <div>{club.data.description}</div>
                </div>
              ) : (
                <StyledMuted>No club description yet.</StyledMuted>
              )}
            </>
          )}
        </StyledSectionCard>

        {!permissions.isMember && effectiveJoinMode !== 'public_direct' ? (
          <StyledSectionCard>
            <StyledSectionTitle>Club Access</StyledSectionTitle>
            {busyAction === 'accept-invite' ? (
              <StyledMuted>Accepting invite link...</StyledMuted>
            ) : latestOwnRequest?.data.status === 'pending' ? (
              <StyledMuted>Your join request is pending review.</StyledMuted>
            ) : canRequestJoin ? (
              <>
                <StyledMuted>
                  This club is private. Use an invite link or submit a join request.
                </StyledMuted>
                <TextField
                  label="Join request message (optional)"
                  multiline
                  minRows={2}
                  value={joinMessage}
                  onChange={(event) => setJoinMessage(event.target.value)}
                />
                <StyledActionRow>
                  <UIButton
                    variant="primary"
                    className="focus-ring"
                    onClick={onRequestJoin}
                    disabled={busyAction === 'request-join'}
                  >
                    {busyAction === 'request-join'
                      ? 'Submitting...'
                      : 'Request to join'}
                  </UIButton>
                </StyledActionRow>
              </>
            ) : (
              <StyledMuted>
                This club is invite-only. Use an invite link from a moderator or
                admin.
              </StyledMuted>
            )}
            {latestOwnRequest && latestOwnRequest.data.status !== 'pending' ? (
              <StyledMuted>
                Latest request status: {latestOwnRequest.data.status}
              </StyledMuted>
            ) : null}
          </StyledSectionCard>
        ) : null}

        {permissions.canCreateInvites ? (
          <StyledSectionCard>
            <StyledSectionTitle>Invite Links</StyledSectionTitle>
            <StyledActionRow>
              <TextField
                label="Max uses"
                value={inviteMaxUses}
                onChange={(event) => setInviteMaxUses(event.target.value)}
                placeholder="Unlimited"
                size="small"
              />
              <TextField
                label="Expires in days"
                value={inviteExpiresInDays}
                onChange={(event) => setInviteExpiresInDays(event.target.value)}
                size="small"
              />
              <UIButton
                variant="primary"
                className="focus-ring"
                onClick={onCreateInvite}
                disabled={busyAction === 'create-invite'}
              >
                {busyAction === 'create-invite' ? 'Creating...' : 'Create invite'}
              </UIButton>
            </StyledActionRow>
            {invites.length ? (
              <StyledRequestList>
                {invites.map((invite) => (
                  <StyledRequestRow key={invite.docId}>
                    <StyledActionRow>
                      <StyledInviteCode>{invite.data.inviteCode}</StyledInviteCode>
                      <StyledMuted>
                        uses: {invite.data.usesCount}
                        {invite.data.maxUses ? ` / ${invite.data.maxUses}` : ''}
                      </StyledMuted>
                    </StyledActionRow>
                    <StyledActionRow>
                      <UIButton
                        variant="ghost"
                        className="focus-ring"
                        onClick={() => void onCopyInvite(invite)}
                      >
                        Copy link
                      </UIButton>
                      {invite.data.revokedAt ? (
                        <StyledMuted>Revoked</StyledMuted>
                      ) : (
                        <UIButton
                          variant="danger"
                          className="focus-ring"
                          onClick={() => void onRevokeInvite(invite.docId)}
                          disabled={busyAction === `revoke-${invite.docId}`}
                        >
                          Revoke
                        </UIButton>
                      )}
                    </StyledActionRow>
                  </StyledRequestRow>
                ))}
              </StyledRequestList>
            ) : (
              <StyledMuted>No invite links yet.</StyledMuted>
            )}
          </StyledSectionCard>
        ) : null}

        {permissions.canReviewJoinRequests ? (
          <StyledSectionCard>
            <StyledSectionTitle>Join Requests</StyledSectionTitle>
            {pendingRequests.length ? (
              <StyledRequestList>
                {pendingRequests.map((request) => (
                  <StyledRequestRow key={request.docId}>
                    <div>
                      <strong>{request.data.requester?.displayName ?? 'Unknown user'}</strong>
                    </div>
                    {request.data.message ? <StyledMuted>{request.data.message}</StyledMuted> : null}
                    <StyledActionRow>
                      <UIButton
                        variant="primary"
                        className="focus-ring"
                        onClick={() => void onReviewRequest(request.docId, 'approved')}
                        disabled={busyAction === `review-${request.docId}-approved`}
                      >
                        Approve
                      </UIButton>
                      <UIButton
                        variant="danger"
                        className="focus-ring"
                        onClick={() => void onReviewRequest(request.docId, 'denied')}
                        disabled={busyAction === `review-${request.docId}-denied`}
                      >
                        Deny
                      </UIButton>
                    </StyledActionRow>
                  </StyledRequestRow>
                ))}
              </StyledRequestList>
            ) : (
              <StyledMuted>No pending requests.</StyledMuted>
            )}
          </StyledSectionCard>
        ) : null}

        <StyledSectionCard>
          <StyledSectionTitle>Members</StyledSectionTitle>
          {loading ? (
            <StyledMuted>Loading members...</StyledMuted>
          ) : (
            <StyledMemberList>
              {members.map((member) => {
                const isSelf = member.data.uid === userId;
                const canChangeRole = canActorChangeMemberRole(
                  permissions.role,
                  isSelf
                );
                const canRemove = canActorRemoveMember(
                  permissions.role,
                  member.data.role,
                  isSelf
                );

                return (
                  <StyledMemberRow key={member.docId}>
                    <StyledMemberMeta>
                      <strong>{member.data.displayName || 'Unknown member'}</strong>
                      <StyledMemberRole>
                        {roleDisplayName(member.data.role)}
                        {isSelf ? ' (You)' : ''}
                      </StyledMemberRole>
                    </StyledMemberMeta>
                    <StyledActionRow>
                      {canChangeRole ? (
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel id={`role-${member.docId}`}>Role</InputLabel>
                          <Select
                            labelId={`role-${member.docId}`}
                            label="Role"
                            value={member.data.role}
                            onChange={(event) =>
                              void onChangeMemberRole(
                                member.docId,
                                event.target.value as UserRole
                              )
                            }
                            disabled={busyAction === `role-${member.docId}`}
                          >
                            <MenuItem value="standard">Member</MenuItem>
                            <MenuItem value="moderator">Moderator</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      ) : null}
                      {canRemove ? (
                        <UIButton
                          variant="danger"
                          className="focus-ring"
                          onClick={() => void onRemoveMember(member.docId)}
                          disabled={busyAction === `remove-${member.docId}`}
                        >
                          Remove
                        </UIButton>
                      ) : null}
                    </StyledActionRow>
                  </StyledMemberRow>
                );
              })}
            </StyledMemberList>
          )}
        </StyledSectionCard>
      </div>
    </StyledClubDetailsContainer>
  );
};
