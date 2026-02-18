import { UIButton } from '@components/ui';
import { useCurrentUserStore } from '@hooks';
import { useToast } from '@lib/ToastContext';
import type { UserSettings } from '@types';
import {
  removeUserProgressReportsFromMembershipClubs,
  updateUserSettings,
} from '@utils';
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  StyledActionBar,
  StyledFormRow,
  StyledSettingsCard,
  StyledSettingsGrid,
  StyledSettingsHeading,
  StyledSettingsHint,
  StyledSettingsPage,
  StyledSettingsTitle,
} from './styles';

const cloneSettings = (settings: UserSettings): UserSettings => {
  return JSON.parse(JSON.stringify(settings)) as UserSettings;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Saving settings timed out. Please try again.'));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
};

export const Settings = () => {
  const { showError, showSuccess } = useToast();
  const {
    currentUser,
    settings,
    setSettings,
    setClubContextCollapsed,
    clubContextCollapsed,
  } = useCurrentUserStore();
  const [draft, setDraft] = useState<UserSettings>(cloneSettings(settings));
  const [saving, setSaving] = useState(false);
  const selectSx = {
    '& .MuiSelect-select': {
      paddingTop: '11px',
      paddingBottom: '11px',
    },
  };
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(draft);
  }, [settings, draft]);

  useEffect(() => {
    setDraft(cloneSettings(settings));
  }, [settings]);

  const saveSettings = async () => {
    if (!currentUser?.docId || saving || !hasChanges) return;
    const userId = currentUser.docId;
    const memberships = currentUser.data.memberships ?? [];
    const shouldRemoveProgress =
      settings.privacy.shareReadingProgress &&
      !draft.privacy.shareReadingProgress;
    const previousSettings = settings;
    const previousCollapsed = clubContextCollapsed;

    setSaving(true);
    setSettings(cloneSettings(draft));
    setClubContextCollapsed(draft.clubContext.defaultCollapsed);

    try {
      await withTimeout(updateUserSettings(userId, draft), 12000);

      if (shouldRemoveProgress) {
        // Run cleanup in the background so save doesn't block for long-running updates.
        void removeUserProgressReportsFromMembershipClubs(userId, memberships).catch(
          (error) => {
            showError(
              `Settings saved, but progress cleanup failed: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        );
      }

      showSuccess('Settings updated');
    } catch (error) {
      setSettings(previousSettings);
      setClubContextCollapsed(previousCollapsed);
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledSettingsPage className="fade-up">
      <StyledSettingsTitle>Settings</StyledSettingsTitle>

      <StyledSettingsGrid>
        <StyledSettingsCard>
          <StyledSettingsHeading>Appearance</StyledSettingsHeading>
          <StyledFormRow>
            <FormControl fullWidth size="small">
              <InputLabel id="theme-mode-label">Theme mode</InputLabel>
              <Select
                labelId="theme-mode-label"
                value={draft.theme.mode}
                label="Theme mode"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    theme: {
                      ...previous.theme,
                      mode: event.target.value as UserSettings['theme']['mode'],
                    },
                  }))
                }
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="light">Light</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="accent-preset-label">Accent preset</InputLabel>
              <Select
                labelId="accent-preset-label"
                value={draft.theme.accentPreset}
                label="Accent preset"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    theme: {
                      ...previous.theme,
                      accentPreset: event.target
                        .value as UserSettings['theme']['accentPreset'],
                    },
                  }))
                }
              >
                <MenuItem value="classic">Classic Brass</MenuItem>
                <MenuItem value="forest">Forest</MenuItem>
                <MenuItem value="rose">Rose</MenuItem>
              </Select>
            </FormControl>
          </StyledFormRow>
        </StyledSettingsCard>

        <StyledSettingsCard>
          <StyledSettingsHeading>Date &amp; Navigation</StyledSettingsHeading>
          <StyledFormRow>
            <FormControl fullWidth size="small">
              <InputLabel id="date-locale-label">Date locale</InputLabel>
              <Select
                labelId="date-locale-label"
                value={draft.dateTime.locale}
                label="Date locale"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    dateTime: {
                      ...previous.dateTime,
                      locale: event.target.value as UserSettings['dateTime']['locale'],
                    },
                  }))
                }
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="en-US">English (US)</MenuItem>
                <MenuItem value="en-GB">English (UK)</MenuItem>
                <MenuItem value="da-DK">Danish</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="time-format-label">Time format</InputLabel>
              <Select
                labelId="time-format-label"
                value={draft.dateTime.timeFormat}
                label="Time format"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    dateTime: {
                      ...previous.dateTime,
                      timeFormat: event.target
                        .value as UserSettings['dateTime']['timeFormat'],
                    },
                  }))
                }
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
                <MenuItem value="12h">12-hour</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="landing-tab-label">Default landing tab</InputLabel>
              <Select
                labelId="landing-tab-label"
                value={draft.navigation.defaultLandingTab}
                label="Default landing tab"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    navigation: {
                      ...previous.navigation,
                      defaultLandingTab: event.target
                        .value as UserSettings['navigation']['defaultLandingTab'],
                    },
                  }))
                }
              >
                <MenuItem value="home">Dashboard</MenuItem>
                <MenuItem value="meetings">Meetings</MenuItem>
                <MenuItem value="books">Library</MenuItem>
                <MenuItem value="clubs">Clubs</MenuItem>
              </Select>
            </FormControl>
          </StyledFormRow>
        </StyledSettingsCard>

        <StyledSettingsCard>
          <StyledSettingsHeading>Privacy &amp; Behavior</StyledSettingsHeading>
          <StyledFormRow>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.privacy.shareOnlinePresence}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      privacy: {
                        ...previous.privacy,
                        shareOnlinePresence: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Share online presence with club members"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.privacy.shareReadingProgress}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      privacy: {
                        ...previous.privacy,
                        shareReadingProgress: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Share my reading progress"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.automation.autoMarkReadWhenMeetingsPassed}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      automation: {
                        ...previous.automation,
                        autoMarkReadWhenMeetingsPassed: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Auto-mark reading books as read after scheduled meetings pass"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="auto-mark-threshold-label">
                Minimum scheduled meetings
              </InputLabel>
              <Select
                labelId="auto-mark-threshold-label"
                value={String(draft.automation.autoMarkReadMinimumScheduledMeetings)}
                label="Minimum scheduled meetings"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    automation: {
                      ...previous.automation,
                      autoMarkReadMinimumScheduledMeetings: Number(event.target.value),
                    },
                  }))
                }
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={String(value)}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </StyledFormRow>
        </StyledSettingsCard>

        <StyledSettingsCard>
          <StyledSettingsHeading>Comments &amp; Club Context</StyledSettingsHeading>
          <StyledFormRow>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.comments.defaultSpoilerEnabled}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      comments: {
                        ...previous.comments,
                        defaultSpoilerEnabled: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Enable spoiler by default for new comments"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="default-note-type-label">Default note type</InputLabel>
              <Select
                labelId="default-note-type-label"
                value={draft.comments.defaultNoteType}
                label="Default note type"
                sx={selectSx}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    comments: {
                      ...previous.comments,
                      defaultNoteType: event.target
                        .value as UserSettings['comments']['defaultNoteType'],
                    },
                  }))
                }
              >
                <MenuItem value="comment">Comment</MenuItem>
                <MenuItem value="suggestion">Suggestion</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="poll">Poll</MenuItem>
                <MenuItem value="reminder">Reminder</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={draft.clubContext.autoSelectLastActiveClub}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      clubContext: {
                        ...previous.clubContext,
                        autoSelectLastActiveClub: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Auto-select last active club on startup"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.clubContext.defaultCollapsed}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      clubContext: {
                        ...previous.clubContext,
                        defaultCollapsed: event.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Default club context to collapsed"
            />
          </StyledFormRow>
        </StyledSettingsCard>

        <StyledSettingsCard>
          <StyledSettingsHeading>Notifications</StyledSettingsHeading>
          <StyledSettingsHint>
            TODO: connect these controls to in-app/email/push notification delivery.
          </StyledSettingsHint>
          <StyledFormRow>
            <FormControlLabel
              control={<Switch checked={draft.notifications.meetingReminders} disabled />}
              label="Meeting reminders"
            />
            <FormControlLabel
              control={<Switch checked={draft.notifications.mentions} disabled />}
              label="Mentions"
            />
            <FormControlLabel
              control={<Switch checked={draft.notifications.clubAnnouncements} disabled />}
              label="Club announcements"
            />
            <FormControlLabel
              control={<Switch checked={draft.notifications.emailDigest} disabled />}
              label="Email digest"
            />
          </StyledFormRow>
        </StyledSettingsCard>
      </StyledSettingsGrid>

      <StyledActionBar>
        <UIButton
          type="button"
          variant="primary"
          onClick={saveSettings}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </UIButton>
      </StyledActionBar>
    </StyledSettingsPage>
  );
};
