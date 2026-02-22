import { UIButton } from '@components/ui';
import { NOTE_TYPE_OPTIONS, WEEKDAY_OPTIONS } from '@components/Club/ClubFormStepContent';
import { useCurrentUserStore } from '@hooks';
import {
  DEFAULT_CLUB_SETTINGS,
  getClubJoinModeLabel,
  normalizeCreateClubAccessMode,
} from '@lib/clubSettings';
import { formatClubTitleWithRole } from '@lib/clubRoleLabels';
import { mapClubRow } from '@lib/mappers';
import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import { Club, ClubSettings, MeetingCommentType, UserRole } from '@types';
import { updateClubProfile, updateClubSettings } from '@utils';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  StyledActionRow,
  StyledAdminSectionFields,
  StyledAdminGrid,
  StyledClubDetailsContainer,
  StyledClubsPageTitle,
  StyledMuted,
  StyledSectionCard,
  StyledSectionTitle,
} from './styles';
import {
  isClubMemberRole,
  resolveMembershipRoleWithRetry,
  type ClubMemberRole,
} from './adminAccess';

const cloneSettings = (value: ClubSettings): ClubSettings => {
  return JSON.parse(JSON.stringify(value)) as ClubSettings;
};

export const ClubAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const currentUser = useCurrentUserStore((state) => state.currentUser);

  const [club, setClub] = useState<Club>();
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    isPrivate: false,
    tagline: '',
    description: '',
  });
  const [settingsDraft, setSettingsDraft] = useState<ClubSettings>(
    cloneSettings(DEFAULT_CLUB_SETTINGS)
  );
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const isAdmin = role === 'admin';

  const resolveCurrentUserId = useCallback(async () => {
    if (currentUser?.docId) {
      return currentUser.docId;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user?.id ?? null;
  }, [currentUser?.docId]);

  const fetchMembershipRole = useCallback(
    async (userId: string): Promise<ClubMemberRole | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data || !isClubMemberRole(data.role)) return null;
      return data.role;
    },
    [id]
  );

  const updateAdminState = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resolvedUserId = await resolveCurrentUserId();
      if (!resolvedUserId) {
        setRole(null);
        return;
      }

      const [{ data: clubRow, error: clubError }, initialRole] = await Promise.all([
        supabase.from('clubs').select('*').eq('id', id).single(),
        fetchMembershipRole(resolvedUserId),
      ]);

      if (clubError) throw clubError;
      if (!clubRow) {
        setClub(undefined);
        setRole(null);
        return;
      }

      const mappedClub = mapClubRow(clubRow as unknown as Record<string, unknown>);
      setClub(mappedClub);
      setProfileDraft({
        name: mappedClub.data.name,
        isPrivate: mappedClub.data.isPrivate,
        tagline: mappedClub.data.tagline ?? '',
        description: mappedClub.data.description ?? '',
      });
      setSettingsDraft(cloneSettings(mappedClub.data.settings ?? DEFAULT_CLUB_SETTINGS));

      const canRetryMembershipCheck = Boolean(currentUser?.data.memberships?.includes(id));
      const resolvedRole = await resolveMembershipRoleWithRetry({
        initialRole,
        canRetry: canRetryMembershipCheck,
        fetchMembershipRole: () => fetchMembershipRole(resolvedUserId),
      });

      setRole(resolvedRole);
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.data.memberships, fetchMembershipRole, id, resolveCurrentUserId, showError]);

  useEffect(() => {
    void updateAdminState();
  }, [updateAdminState]);

  const workflowSummary = useMemo(() => {
    return `${settingsDraft.meetings.cadence} cadence, ${settingsDraft.readingWorkflow.votingWindowDays}-day voting window`;
  }, [settingsDraft]);
  const effectiveJoinMode = useMemo(() => {
    return normalizeCreateClubAccessMode(
      profileDraft.isPrivate,
      settingsDraft.access.joinMode
    );
  }, [profileDraft.isPrivate, settingsDraft.access.joinMode]);

  const onSaveProfile = async () => {
    if (!id) return;

    try {
      setSavingProfile(true);
      await updateClubProfile(id, {
        name: profileDraft.name,
        isPrivate: profileDraft.isPrivate,
        tagline: profileDraft.tagline,
        description: profileDraft.description,
      });
      showSuccess('Club profile updated');
      await updateAdminState();
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const onSaveSettings = async () => {
    if (!id) return;

    try {
      setSavingSettings(true);
      await updateClubSettings(id, settingsDraft, profileDraft.isPrivate);
      showSuccess('Club configuration updated');
      await updateAdminState();
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <StyledClubDetailsContainer>
        <StyledMuted>Loading admin configuration...</StyledMuted>
      </StyledClubDetailsContainer>
    );
  }

  if (!isAdmin) {
    return (
      <StyledClubDetailsContainer>
        <StyledSectionCard>
          <StyledSectionTitle>Admin Access Required</StyledSectionTitle>
          <StyledMuted>
            Only club admins can access this configuration page.
          </StyledMuted>
          <StyledActionRow>
            <UIButton
              variant="primary"
              className="focus-ring"
              onClick={() => navigate(`/clubs/${id}`)}
            >
              Back to club
            </UIButton>
          </StyledActionRow>
        </StyledSectionCard>
      </StyledClubDetailsContainer>
    );
  }

  return (
    <StyledClubDetailsContainer>
      <StyledActionRow>
        <StyledClubsPageTitle>
          {formatClubTitleWithRole(club?.data.name ?? 'Club', role)} Settings
        </StyledClubsPageTitle>
        <UIButton
          variant="ghost"
          className="focus-ring"
          onClick={() => navigate(`/clubs/${id}`)}
        >
          Open Club Page
        </UIButton>
      </StyledActionRow>
      <StyledMuted>Required: club name. All other fields are optional.</StyledMuted>

      <StyledAdminGrid>
        <StyledSectionCard>
          <StyledSectionTitle>General</StyledSectionTitle>
          <StyledAdminSectionFields>
            <TextField
              label="Club name"
              required
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
              helperText="Optional"
              value={profileDraft.tagline}
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
              helperText="Optional"
              value={profileDraft.description}
              onChange={(event) =>
                setProfileDraft((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={profileDraft.isPrivate}
                  onChange={(event) =>
                    setProfileDraft((previous) => ({
                      ...previous,
                      isPrivate: event.target.checked,
                    }))
                  }
                />
              }
              label="Private club"
            />
          </StyledAdminSectionFields>
          <StyledActionRow>
            <UIButton
              variant="primary"
              className="focus-ring"
              onClick={() => void onSaveProfile()}
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save General'}
            </UIButton>
          </StyledActionRow>
        </StyledSectionCard>

        <StyledSectionCard>
          <StyledSectionTitle>Access and Moderation</StyledSectionTitle>
          <StyledAdminSectionFields>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-join-mode">Join method</InputLabel>
              <Select
                labelId="admin-join-mode"
                label="Join method"
                value={effectiveJoinMode}
                disabled={!profileDraft.isPrivate}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    access: {
                      ...previous.access,
                      joinMode: event.target.value as typeof previous.access.joinMode,
                    },
                  }))
                }
              >
                <MenuItem value="public_direct">Public direct join</MenuItem>
                <MenuItem value="invite_only">Invite only</MenuItem>
                <MenuItem value="invite_or_request">Invite + request</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Auto-promote first members"
              value={settingsDraft.access.autoPromoteFirstMembersToModerator}
              inputProps={{ min: 0, max: 50 }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  access: {
                    ...previous.access,
                    autoPromoteFirstMembersToModerator: Number(event.target.value || 0),
                  },
                }))
              }
            />
            <StyledMuted>{getClubJoinModeLabel(effectiveJoinMode)}</StyledMuted>
          </StyledAdminSectionFields>
        </StyledSectionCard>

        <StyledSectionCard>
          <StyledSectionTitle>Meetings and Workflow</StyledSectionTitle>
          <StyledAdminSectionFields>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-cadence">Meeting cadence</InputLabel>
              <Select
                labelId="admin-cadence"
                label="Meeting cadence"
                value={settingsDraft.meetings.cadence}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    meetings: {
                      ...previous.meetings,
                      cadence: event.target.value as typeof previous.meetings.cadence,
                    },
                  }))
                }
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Biweekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-weekday">Preferred weekday</InputLabel>
              <Select
                labelId="admin-weekday"
                label="Preferred weekday"
                value={String(settingsDraft.meetings.preferredWeekday)}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    meetings: {
                      ...previous.meetings,
                      preferredWeekday: Number(event.target.value),
                    },
                  }))
                }
              >
                {WEEKDAY_OPTIONS.map((weekday) => (
                  <MenuItem key={weekday.value} value={String(weekday.value)}>
                    {weekday.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="time"
              label="Preferred time"
              value={settingsDraft.meetings.preferredTime}
              InputLabelProps={{ shrink: true }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  meetings: {
                    ...previous.meetings,
                    preferredTime: event.target.value,
                  },
                }))
              }
            />
            <TextField
              label="Timezone"
              value={settingsDraft.meetings.timezone}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  meetings: {
                    ...previous.meetings,
                    timezone: event.target.value,
                  },
                }))
              }
            />
            <TextField
              type="number"
              label="Voting window days"
              value={settingsDraft.readingWorkflow.votingWindowDays}
              inputProps={{ min: 1, max: 30 }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  readingWorkflow: {
                    ...previous.readingWorkflow,
                    votingWindowDays: Number(event.target.value || 1),
                  },
                }))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settingsDraft.readingWorkflow.autoPromoteWinner}
                  onChange={(event) =>
                    setSettingsDraft((previous) => ({
                      ...previous,
                      readingWorkflow: {
                        ...previous.readingWorkflow,
                        autoPromoteWinner: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Auto-promote winner"
            />
            <TextField
              type="number"
              label="Auto-mark read threshold"
              value={settingsDraft.readingWorkflow.autoMarkReadMinimumScheduledMeetings}
              inputProps={{ min: 1, max: 10 }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  readingWorkflow: {
                    ...previous.readingWorkflow,
                    autoMarkReadMinimumScheduledMeetings: Number(event.target.value || 1),
                  },
                }))
              }
            />
            <StyledMuted>{workflowSummary}</StyledMuted>
          </StyledAdminSectionFields>
        </StyledSectionCard>

        <StyledSectionCard>
          <StyledSectionTitle>Community and Branding</StyledSectionTitle>
          <StyledAdminSectionFields>
            <TextField
              type="number"
              label="Default invite expiry days"
              value={settingsDraft.invites.defaultExpiryDays}
              inputProps={{ min: 1, max: 60 }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  invites: {
                    ...previous.invites,
                    defaultExpiryDays: Number(event.target.value || 7),
                  },
                }))
              }
            />
            <TextField
              type="number"
              label="Default invite max uses"
              value={settingsDraft.invites.defaultMaxUses ?? ''}
              inputProps={{ min: 1, max: 1000 }}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  invites: {
                    ...previous.invites,
                    defaultMaxUses: event.target.value
                      ? Number(event.target.value)
                      : null,
                  },
                }))
              }
              helperText="Leave blank for unlimited"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="admin-spoiler-policy">Spoiler policy</InputLabel>
              <Select
                labelId="admin-spoiler-policy"
                label="Spoiler policy"
                value={settingsDraft.discussion.spoilerPolicy}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    discussion: {
                      ...previous.discussion,
                      spoilerPolicy: event.target.value as typeof previous.discussion.spoilerPolicy,
                    },
                  }))
                }
              >
                <MenuItem value="off">Off</MenuItem>
                <MenuItem value="after_citation_page">After citation page</MenuItem>
                <MenuItem value="custom_page">Custom page threshold</MenuItem>
              </Select>
            </FormControl>
            {settingsDraft.discussion.spoilerPolicy === 'custom_page' ? (
              <TextField
                type="number"
                label="Spoiler reveal page"
                value={settingsDraft.discussion.spoilerRevealAfterPage ?? ''}
                inputProps={{ min: 1, max: 5000 }}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    discussion: {
                      ...previous.discussion,
                      spoilerRevealAfterPage: event.target.value
                        ? Number(event.target.value)
                        : null,
                    },
                  }))
                }
              />
            ) : null}
            <FormControl fullWidth size="small">
              <InputLabel id="admin-note-type">Default note type</InputLabel>
              <Select
                labelId="admin-note-type"
                label="Default note type"
                value={settingsDraft.discussion.defaultNoteType}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    discussion: {
                      ...previous.discussion,
                      defaultNoteType: event.target.value as MeetingCommentType,
                    },
                  }))
                }
              >
                {NOTE_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Onboarding message"
              multiline
              minRows={2}
              value={settingsDraft.onboarding.message}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  onboarding: {
                    ...previous.onboarding,
                    message: event.target.value,
                  },
                }))
              }
            />
            <TextField
              label="Club rules"
              multiline
              minRows={3}
              value={settingsDraft.onboarding.rules}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  onboarding: {
                    ...previous.onboarding,
                    rules: event.target.value,
                  },
                }))
              }
            />
            <FormControl fullWidth size="small">
              <InputLabel id="admin-accent">Accent preset</InputLabel>
              <Select
                labelId="admin-accent"
                label="Accent preset"
                value={settingsDraft.branding.accentPreset}
                onChange={(event) =>
                  setSettingsDraft((previous) => ({
                    ...previous,
                    branding: {
                      ...previous.branding,
                      accentPreset: event.target.value as typeof previous.branding.accentPreset,
                    },
                  }))
                }
              >
                <MenuItem value="classic">Classic</MenuItem>
                <MenuItem value="forest">Forest</MenuItem>
                <MenuItem value="rose">Rose</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Club emoji"
              value={settingsDraft.branding.emoji}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  branding: {
                    ...previous.branding,
                    emoji: event.target.value,
                  },
                }))
              }
            />
            <TextField
              label="Cover image URL"
              value={settingsDraft.branding.coverUrl}
              onChange={(event) =>
                setSettingsDraft((previous) => ({
                  ...previous,
                  branding: {
                    ...previous.branding,
                    coverUrl: event.target.value,
                  },
                }))
              }
            />
          </StyledAdminSectionFields>
          <StyledActionRow>
            <UIButton
              variant="primary"
              className="focus-ring"
              onClick={() => void onSaveSettings()}
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Configuration'}
            </UIButton>
          </StyledActionRow>
        </StyledSectionCard>
      </StyledAdminGrid>

      <Box className="surface" sx={{ p: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Membership, invite-link operations, and join request moderation remain available on the club page.
        </Typography>
      </Box>
    </StyledClubDetailsContainer>
  );
};
