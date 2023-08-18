import {
  Dialog,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FirestoreBook, ReadStatus } from '../../pages/Books/Books';
import {
  StyledBookStatus,
  StyledModalBookForm,
} from '../../pages/Books/styles';
import {
  StyledBookAuthor,
  StyledBookBanner,
  StyledBookDescription,
  StyledBookDescriptionContainer,
  StyledBookTitle,
  StyledDialogContent,
} from './styles';
import React from 'react';

type BookProps = {
  book: FirestoreBook;
  open: boolean;
  onClose: () => void;
  updateBookStatus: (e: SelectChangeEvent) => void;
};

export const BookDetails = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  open,
  onClose,
  updateBookStatus,
}: BookProps) => {
  const [currentStatus, setCurrentStatus] = useState<ReadStatus>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    setCurrentStatus(readStatus);
  }, [readStatus]);

  const handleStatusChange = (e: SelectChangeEvent) => {
    e.preventDefault();
    const selectedStatus = e.target.value as ReadStatus;
    // Sets current status in order to avoid delay when waiting for status from Firestore
    setCurrentStatus(selectedStatus);
    updateBookStatus(e);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>
        <StyledBookTitle title={volumeInfo?.title}>
          {volumeInfo?.title}
        </StyledBookTitle>
        <StyledBookAuthor
          title={
            volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
          }
        >
          by {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
        </StyledBookAuthor>
      </DialogTitle>
      <StyledDialogContent>
        <StyledBookBanner>
          <img
            src={volumeInfo?.imageLinks?.thumbnail}
            alt={volumeInfo?.title}
          />
        </StyledBookBanner>

        {/* Select status form */}
        <StyledModalBookForm>
          <StyledBookStatus>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={currentStatus}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value={'unread'}>Unread</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
                <MenuItem value={'candidate'}>Reading candidate</MenuItem>
                <MenuItem value={'reading'}>Currently reading</MenuItem>
              </Select>
            </FormControl>
          </StyledBookStatus>
        </StyledModalBookForm>

        {volumeInfo?.description && (
          <StyledBookDescriptionContainer>
            <b>Description</b>
            <StyledBookDescription>
              {volumeInfo?.description}
            </StyledBookDescription>
          </StyledBookDescriptionContainer>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};
