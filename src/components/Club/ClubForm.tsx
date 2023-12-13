import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { firestore } from '../../firestore';
import { ClubInfo, FirestoreClub } from '../../types';
import { addNewClubMember, addNewDocument } from '../../utils';
import { StyledDialogContent } from '../Book/styles';
import { StyledModalClubForm } from './styles';

interface ClubFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentId?: string;
}

export const ClubForm = ({ isOpen, onClose, currentId }: ClubFormProps) => {
  const [form, setForm] = useState<ClubInfo>({ name: '', isPrivate: false });
  const [clubs, setClubs] = useState<FirestoreClub[]>();

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

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>{currentId ? 'Edit' : 'Create new'} club</DialogTitle>
      <StyledDialogContent>
        <StyledModalClubForm>
          <FormControl fullWidth style={{ marginTop: 8 }}>
            <TextField
              label="Name"
              variant="outlined"
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value || '' })}
            />
          </FormControl>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  onChange={(e) =>
                    setForm({ ...form, isPrivate: e.target.checked || false })
                  }
                />
              }
              label="Private"
            />
          </FormControl>
        </StyledModalClubForm>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={(e) => handleSubmit(e)}>Ok</Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
