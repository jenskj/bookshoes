import {
  Dialog,
  DialogActions,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import { UIButton } from '@components/ui';
import { StyledModalForm } from '@shared/styles';
import { Club, ClubInfo } from '@types';
import { createClubWithAdmin } from '@utils';
import React, { useEffect, useMemo, useState } from 'react';
import { StyledDialogContent } from '../Book/styles';
import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import { mapClubRow } from '@lib/mappers';
import { useCurrentUserStore } from '@hooks';
import {
  DEFAULT_CLUB_SETTINGS,
  normalizeCreateClubAccessMode,
} from '@lib/clubSettings';
import {
  ClubFormStepContent,
  STEP_LABELS,
  isClubFormStepValid,
} from './ClubFormStepContent';

interface ClubFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentId?: string;
  onCreated?: (clubId: string) => void;
}

const cloneDefaultSettings = () => {
  return JSON.parse(JSON.stringify(DEFAULT_CLUB_SETTINGS));
};

const getInitialForm = (): ClubInfo => ({
  name: '',
  isPrivate: false,
  tagline: '',
  description: '',
  settings: cloneDefaultSettings(),
});

export const ClubForm = ({
  isOpen,
  onClose,
  currentId,
  onCreated,
}: ClubFormProps) => {
  const { showError, showSuccess } = useToast();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const membershipClubs = useCurrentUserStore(
    (state) => state.membershipClubs ?? []
  );
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const setActiveClub = useCurrentUserStore((state) => state.setActiveClub);
  const setMembershipClubs = useCurrentUserStore(
    (state) => state.setMembershipClubs
  );
  const setMembershipRoleForClub = useCurrentUserStore(
    (state) => state.setMembershipRoleForClub
  );
  const [form, setForm] = useState<ClubInfo>(getInitialForm());
  const [clubs, setClubs] = useState<Club[]>();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const TAGLINE_CHARACTER_LIMIT = 50;
  const DESCRIPTION_CHARACTER_LIMIT = 250;

  useEffect(() => {
    supabase.from('clubs').select('*').then(({ data }) => {
      setClubs((data ?? []).map((c) => mapClubRow(c)));
    });
  }, []);

  const stepIsValid = useMemo(
    () => isClubFormStepValid(activeStep, form),
    [activeStep, form]
  );

  const handleClose = () => {
    setForm(getInitialForm());
    setActiveStep(0);
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      showError('Club name is required.');
      setActiveStep(0);
      return;
    }

    if (clubs?.some((club) => club.data.name.toLowerCase() === form.name.trim().toLowerCase())) {
      showError('This name is already used by another book club');
      return;
    }

    if (!form.settings) {
      showError('Club settings are missing.');
      return;
    }

    try {
      setSubmitting(true);
      const normalizedSettings = {
        ...form.settings,
        access: {
          ...form.settings.access,
          joinMode: normalizeCreateClubAccessMode(
            form.isPrivate,
            form.settings.access.joinMode
          ),
        },
      };

      const res = await createClubWithAdmin({
        name: form.name.trim(),
        isPrivate: form.isPrivate,
        tagline: form.tagline?.trim(),
        description: form.description?.trim(),
        settings: normalizedSettings,
      });

      const createdClub: Club = {
        docId: res.id,
        data: {
          name: form.name.trim(),
          isPrivate: form.isPrivate,
          tagline: form.tagline?.trim(),
          description: form.description?.trim(),
          settings: normalizedSettings,
        },
      };

      setActiveClub(createdClub);
      setMembershipClubs([
        ...membershipClubs.filter((club) => club.docId !== createdClub.docId),
        createdClub,
      ]);
      setMembershipRoleForClub(createdClub.docId, 'admin');
      if (currentUser) {
        const nextMemberships = new Set(currentUser.data.memberships ?? []);
        nextMemberships.add(createdClub.docId);
        setCurrentUser({
          ...currentUser,
          data: {
            ...currentUser.data,
            memberships: Array.from(nextMemberships),
            activeClub: createdClub.docId,
          },
        });
      }

      showSuccess('Club created successfully');
      onCreated?.(res.id);
      handleClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    if (!stepIsValid) return;
    setActiveStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
  };

  const onBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{currentId ? 'Edit' : 'Create new'} club</DialogTitle>
      <StyledDialogContent>
        <StyledModalForm>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEP_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <ClubFormStepContent
            activeStep={activeStep}
            form={form}
            setForm={setForm}
            taglineCharacterLimit={TAGLINE_CHARACTER_LIMIT}
            descriptionCharacterLimit={DESCRIPTION_CHARACTER_LIMIT}
          />
        </StyledModalForm>
      </StyledDialogContent>
      <DialogActions>
        <UIButton
          variant="ghost"
          className="focus-ring"
          onClick={activeStep === 0 ? handleClose : onBack}
          disabled={submitting}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </UIButton>
        {activeStep < STEP_LABELS.length - 1 ? (
          <UIButton
            variant="primary"
            className="focus-ring"
            onClick={onNext}
            disabled={!stepIsValid || submitting}
          >
            Next
          </UIButton>
        ) : (
          <UIButton
            variant="primary"
            className="focus-ring"
            onClick={() => void handleSubmit()}
            disabled={!stepIsValid || submitting}
          >
            {submitting ? 'Creating...' : 'Create Club'}
          </UIButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
