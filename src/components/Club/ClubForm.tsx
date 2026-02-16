import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  useTheme,
} from '@mui/material';
import { StyledModalForm } from '@shared/styles';
import { Club, ClubInfo } from '@types';
import { addNewClubMember, addNewDocument } from '@utils';
import React, { useEffect, useState } from 'react';
import { StyledDialogContent } from '../Book/styles';
import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import { mapClubRow } from '@lib/mappers';

interface ClubFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentId?: string;
}

export const ClubForm = ({ isOpen, onClose, currentId }: ClubFormProps) => {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState<ClubInfo>({
    name: '',
    isPrivate: false,
  });
  const [clubs, setClubs] = useState<Club[]>();
  const { palette } = useTheme();
  const TAGLINE_CHARACTER_LIMIT = 50;
  const DESCRIPTION_CHARACTER_LIMIT = 250;

  useEffect(() => {
    supabase.from('clubs').select('*').then(({ data }) => {
      setClubs((data ?? []).map((c) => mapClubRow(c)));
    });
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (form) {
      if (currentId) {
        // If an id is provided, update existing club
      } else {
        if (!clubs?.some((club) => club.data.name === form.name)) {
          try {
            const res = await addNewDocument('clubs', form as unknown as Record<string, unknown>);
            await addNewClubMember(res.id);
            showSuccess('Club created successfully');
            onClose();
          } catch (err) {
            showError(err instanceof Error ? err.message : String(err));
          }
        } else {
          showError('This name is already used by another book club');
        }
      }
    }
  };

  const handleClose = () => {
    setForm({ name: '', isPrivate: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth>
      <DialogTitle>{currentId ? 'Edit' : 'Create new'} club</DialogTitle>
      <StyledDialogContent>
        <StyledModalForm>
          <FormControl fullWidth>
            <TextField
              label="Club name"
              variant="outlined"
              helperText="Make it unique!"
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value || '' })}
            />
          </FormControl>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(e) =>
                    setForm({ ...form, isPrivate: e.target.checked || false })
                  }
                />
              }
              label="Private club"
            />
            <FormHelperText>
              If checked, only those invited can join
            </FormHelperText>
          </FormControl>
          <FormControl>
            <TextField
              label={`Tagline (${
                form?.tagline?.length || 0
              }/${TAGLINE_CHARACTER_LIMIT})`}
              helperText="Write a tagline that fits the vibe of your bookclub"
              InputLabelProps={{
                style:
                  form?.tagline?.length &&
                  form?.tagline?.length >= TAGLINE_CHARACTER_LIMIT
                    ? {
                        color: palette.warning.main,
                      }
                    : undefined,
              }}
              variant="outlined"
              value={form?.tagline}
              onChange={(e) =>
                setForm({ ...form, tagline: e.target.value || '' })
              }
              inputProps={{ maxLength: TAGLINE_CHARACTER_LIMIT }}
            />
          </FormControl>
          <FormControl>
            <TextField
              label={`Description (${
                form?.description?.length || 0
              }/${DESCRIPTION_CHARACTER_LIMIT})`}
              InputLabelProps={{
                style:
                  form?.description?.length &&
                  form?.description?.length >= DESCRIPTION_CHARACTER_LIMIT
                    ? {
                        color: palette.warning.main,
                      }
                    : undefined,
              }}
              multiline
              helperText="Write a few words about the bookclub you're starting"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value || '' })
              }
              maxRows={10}
              inputProps={{ maxLength: DESCRIPTION_CHARACTER_LIMIT }}
            />
          </FormControl>
        </StyledModalForm>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={(e) => handleSubmit(e)}>Ok</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
