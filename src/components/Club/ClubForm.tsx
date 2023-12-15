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
import React, { useEffect, useState } from 'react';
import { firestore } from '../../firestore';
import { StyledModalForm } from '../../shared/styles';
import { ClubInfo, FirestoreClub } from '../../types';
import { addNewClubMember, addNewDocument } from '../../utils';
import { StyledDialogContent } from '../Book/styles';

interface ClubFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentId?: string;
}

export const ClubForm = ({ isOpen, onClose, currentId }: ClubFormProps) => {
  const [form, setForm] = useState<ClubInfo>({
    name: '',
    isPrivate: false,
  });
  const [clubs, setClubs] = useState<FirestoreClub[]>();
  // To do: figure out if this is even necessary
  // const [helperTexts, setHelperTexts] = useState<
  //   Record<keyof ClubInfo, boolean>
  // >({
  //   // Is there a TS-fancy way of doing this?
  //   name: false,
  //   tagline: false,
  //   isPrivate: false,
  //   description: false,
  //   members: false,
  // });
  const { palette } = useTheme();
  const TAGLINE_CHARACTER_LIMIT = 50;
  const DESCRIPTION_CHARACTER_LIMIT = 250;

  useEffect(() => {
    const fetchData = async () => {
      const clubRef = await firestore.collection('clubs').get();
      const newClubs = clubRef.docs.map((doc) => ({
        docId: doc.id,
        data: doc.data() as ClubInfo,
      })) as FirestoreClub[];
      setClubs(newClubs);
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (form) {
      if (currentId) {
        // If an id is provided, update existing club
      } else {
        // If not, add new club to 'clubs' collection
        if (!clubs?.some((club) => club.data.name === form.name)) {
          // If the name is available
          addNewDocument('clubs', form).then((res: any) =>
            addNewClubMember(res.id)
          );
          onClose();
        } else {
          // If it is unavailable, alert the user
          alert('This name is already used by another book club');
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
              rows={4}
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
