import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { MeetingCommentType, ClubInfo } from '@types';
import type { Dispatch, SetStateAction } from 'react';
import {
  getClubJoinModeLabel,
  normalizeCreateClubAccessMode,
} from '@lib/clubSettings';

export const NOTE_TYPE_OPTIONS: MeetingCommentType[] = [
  'comment',
  'suggestion',
  'announcement',
  'poll',
  'reminder',
];

export const WEEKDAY_OPTIONS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const STEP_LABELS = [
  'Identity',
  'Access',
  'Workflow',
  'Community',
  'Branding',
] as const;

export const isClubFormStepValid = (activeStep: number, form: ClubInfo) => {
  if (activeStep === 0) {
    return Boolean(form.name?.trim());
  }
  if (activeStep === 3 && form.settings?.discussion.spoilerPolicy === 'custom_page') {
    return Boolean(form.settings.discussion.spoilerRevealAfterPage);
  }
  return true;
};

interface ClubFormStepContentProps {
  activeStep: number;
  form: ClubInfo;
  setForm: Dispatch<SetStateAction<ClubInfo>>;
  taglineCharacterLimit: number;
  descriptionCharacterLimit: number;
}

export const ClubFormStepContent = ({
  activeStep,
  form,
  setForm,
  taglineCharacterLimit,
  descriptionCharacterLimit,
}: ClubFormStepContentProps) => {
  const { palette } = useTheme();
  const settings = form.settings;

  if (!settings) {
    return null;
  }

  if (activeStep === 0) {
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          Define your club identity and discovery preset.
        </Typography>
        <FormControl fullWidth>
          <TextField
            label="Club name"
            variant="outlined"
            helperText="Make it unique"
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, name: event.target.value }))
            }
          />
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="club-preset-label">Club preset</InputLabel>
          <Select
            labelId="club-preset-label"
            value={settings.setup.preset}
            label="Club preset"
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  setup: {
                    ...settings.setup,
                    preset: event.target.value as typeof settings.setup.preset,
                  },
                },
              }))
            }
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="classics">Classics</MenuItem>
            <MenuItem value="non_fiction">Non-fiction</MenuItem>
            <MenuItem value="genre">Genre</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <TextField
            label={`Tagline (${form.tagline?.length || 0}/${taglineCharacterLimit})`}
            helperText="A short one-liner for your club"
            InputLabelProps={{
              style:
                form.tagline?.length && form.tagline.length >= taglineCharacterLimit
                  ? { color: palette.warning.main }
                  : undefined,
            }}
            variant="outlined"
            value={form.tagline}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                tagline: event.target.value,
              }))
            }
            inputProps={{ maxLength: taglineCharacterLimit }}
          />
        </FormControl>
        <FormControl>
          <TextField
            label={`Description (${form.description?.length || 0}/${descriptionCharacterLimit})`}
            multiline
            helperText="Describe the tone and reading style"
            InputLabelProps={{
              style:
                form.description?.length &&
                form.description.length >= descriptionCharacterLimit
                  ? { color: palette.warning.main }
                  : undefined,
            }}
            value={form.description}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            maxRows={10}
            inputProps={{ maxLength: descriptionCharacterLimit }}
          />
        </FormControl>
      </>
    );
  }

  if (activeStep === 1) {
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          Configure who can join and early moderation defaults.
        </Typography>
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isPrivate}
                onChange={(event) => {
                  const isPrivate = event.target.checked;
                  setForm((previous) => ({
                    ...previous,
                    isPrivate,
                    settings: {
                      ...settings,
                      access: {
                        ...settings.access,
                        joinMode: normalizeCreateClubAccessMode(
                          isPrivate,
                          settings.access.joinMode
                        ),
                      },
                    },
                  }));
                }}
              />
            }
            label="Private club"
          />
          <FormHelperText>
            Private clubs require invite links or request approval.
          </FormHelperText>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="join-mode-label">Join method</InputLabel>
          <Select
            labelId="join-mode-label"
            label="Join method"
            value={settings.access.joinMode}
            disabled={!form.isPrivate}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  access: {
                    ...settings.access,
                    joinMode: event.target.value as typeof settings.access.joinMode,
                  },
                },
              }))
            }
          >
            <MenuItem value="invite_only">Invite only</MenuItem>
            <MenuItem value="invite_or_request">Invite + request</MenuItem>
            <MenuItem value="public_direct">Public direct join</MenuItem>
          </Select>
          <FormHelperText>
            {!form.isPrivate
              ? 'Public clubs always use direct join.'
              : getClubJoinModeLabel(settings.access.joinMode)}
          </FormHelperText>
        </FormControl>
        <TextField
          type="number"
          label="Auto-promote first members to moderator"
          value={settings.access.autoPromoteFirstMembersToModerator}
          inputProps={{ min: 0, max: 50 }}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                access: {
                  ...settings.access,
                  autoPromoteFirstMembersToModerator: Number(event.target.value || 0),
                },
              },
            }))
          }
          helperText="0 disables auto-promotion"
        />
      </>
    );
  }

  if (activeStep === 2) {
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          Set default meeting cadence and reading workflow.
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="cadence-label">Meeting cadence</InputLabel>
          <Select
            labelId="cadence-label"
            label="Meeting cadence"
            value={settings.meetings.cadence}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  meetings: {
                    ...settings.meetings,
                    cadence: event.target.value as typeof settings.meetings.cadence,
                  },
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
          <InputLabel id="weekday-label">Preferred weekday</InputLabel>
          <Select
            labelId="weekday-label"
            label="Preferred weekday"
            value={String(settings.meetings.preferredWeekday)}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  meetings: {
                    ...settings.meetings,
                    preferredWeekday: Number(event.target.value),
                  },
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
          label="Preferred time"
          type="time"
          value={settings.meetings.preferredTime}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                meetings: {
                  ...settings.meetings,
                  preferredTime: event.target.value,
                },
              },
            }))
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Timezone"
          value={settings.meetings.timezone}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                meetings: {
                  ...settings.meetings,
                  timezone: event.target.value,
                },
              },
            }))
          }
          helperText="Use IANA timezone (e.g. America/New_York) or system"
        />
        <TextField
          type="number"
          label="Voting window (days)"
          value={settings.readingWorkflow.votingWindowDays}
          inputProps={{ min: 1, max: 30 }}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                readingWorkflow: {
                  ...settings.readingWorkflow,
                  votingWindowDays: Number(event.target.value || 1),
                },
              },
            }))
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.readingWorkflow.autoPromoteWinner}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  settings: {
                    ...settings,
                    readingWorkflow: {
                      ...settings.readingWorkflow,
                      autoPromoteWinner: event.target.checked,
                    },
                  },
                }))
              }
            />
          }
          label="Auto-promote voting winner"
        />
        <TextField
          type="number"
          label="Auto-mark read threshold"
          value={settings.readingWorkflow.autoMarkReadMinimumScheduledMeetings}
          inputProps={{ min: 1, max: 10 }}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                readingWorkflow: {
                  ...settings.readingWorkflow,
                  autoMarkReadMinimumScheduledMeetings: Number(event.target.value || 1),
                },
              },
            }))
          }
          helperText="Scheduled meetings needed before auto-marking read"
        />
      </>
    );
  }

  if (activeStep === 3) {
    return (
      <>
        <Typography variant="body2" color="text.secondary">
          Define invites, discussion defaults, and onboarding content.
        </Typography>
        <TextField
          type="number"
          label="Default invite expiry (days)"
          value={settings.invites.defaultExpiryDays}
          inputProps={{ min: 1, max: 60 }}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                invites: {
                  ...settings.invites,
                  defaultExpiryDays: Number(event.target.value || 7),
                },
              },
            }))
          }
        />
        <TextField
          type="number"
          label="Default invite max uses"
          value={settings.invites.defaultMaxUses ?? ''}
          inputProps={{ min: 1, max: 1000 }}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                invites: {
                  ...settings.invites,
                  defaultMaxUses: event.target.value
                    ? Number(event.target.value)
                    : null,
                },
              },
            }))
          }
          helperText="Leave empty for unlimited"
        />
        <FormControl fullWidth size="small">
          <InputLabel id="spoiler-policy-label">Spoiler policy</InputLabel>
          <Select
            labelId="spoiler-policy-label"
            label="Spoiler policy"
            value={settings.discussion.spoilerPolicy}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  discussion: {
                    ...settings.discussion,
                    spoilerPolicy: event.target.value as typeof settings.discussion.spoilerPolicy,
                  },
                },
              }))
            }
          >
            <MenuItem value="off">Off</MenuItem>
            <MenuItem value="after_citation_page">After citation page</MenuItem>
            <MenuItem value="custom_page">Custom page threshold</MenuItem>
          </Select>
        </FormControl>
        {settings.discussion.spoilerPolicy === 'custom_page' ? (
          <TextField
            type="number"
            label="Spoiler reveal after page"
            value={settings.discussion.spoilerRevealAfterPage ?? ''}
            inputProps={{ min: 1, max: 5000 }}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  discussion: {
                    ...settings.discussion,
                    spoilerRevealAfterPage: event.target.value
                      ? Number(event.target.value)
                      : null,
                  },
                },
              }))
            }
          />
        ) : null}
        <FormControl fullWidth size="small">
          <InputLabel id="note-type-label">Default note type</InputLabel>
          <Select
            labelId="note-type-label"
            label="Default note type"
            value={settings.discussion.defaultNoteType}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                settings: {
                  ...settings,
                  discussion: {
                    ...settings.discussion,
                    defaultNoteType: event.target.value as MeetingCommentType,
                  },
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
          value={settings.onboarding.message}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                onboarding: {
                  ...settings.onboarding,
                  message: event.target.value,
                },
              },
            }))
          }
        />
        <TextField
          label="Club rules"
          multiline
          minRows={3}
          value={settings.onboarding.rules}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                onboarding: {
                  ...settings.onboarding,
                  rules: event.target.value,
                },
              },
            }))
          }
        />
      </>
    );
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary">
        Add optional branding and review before creating.
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="accent-preset-label">Accent preset</InputLabel>
        <Select
          labelId="accent-preset-label"
          label="Accent preset"
          value={settings.branding.accentPreset}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              settings: {
                ...settings,
                branding: {
                  ...settings.branding,
                  accentPreset: event.target.value as typeof settings.branding.accentPreset,
                },
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
        value={settings.branding.emoji}
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            settings: {
              ...settings,
              branding: {
                ...settings.branding,
                emoji: event.target.value,
              },
            },
          }))
        }
        helperText="Optional: one emoji to represent the club"
      />
      <TextField
        label="Cover image URL"
        value={settings.branding.coverUrl}
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            settings: {
              ...settings,
              branding: {
                ...settings.branding,
                coverUrl: event.target.value,
              },
            },
          }))
        }
      />
      <Box className="surface" sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">Review</Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>{form.name || 'Unnamed club'}</strong>
          {form.tagline ? ` - ${form.tagline}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {form.isPrivate ? 'Private club' : 'Public club'} /{' '}
          {getClubJoinModeLabel(
            normalizeCreateClubAccessMode(form.isPrivate, settings.access.joinMode)
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cadence: {settings.meetings.cadence}, Voting window:{' '}
          {settings.readingWorkflow.votingWindowDays} days
        </Typography>
      </Box>
    </>
  );
};
