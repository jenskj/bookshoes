import { supabase } from '@lib/supabase';
import { UIButton } from '@components/ui';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useToast } from '@lib/ToastContext';
import { StyledModalForm } from '@shared/styles';
import { Book, MeetingInfo } from '@types';
import { addBook, addMeeting, notEmpty, updateBookScheduledMeetings, updateMeeting } from '@utils';
import { addMonths, isEqual, setHours, setMinutes } from 'date-fns';
import da from 'date-fns/locale/da';
import React, { useEffect, useState } from 'react';

interface MeetingFormProps {
  currentId?: string;
  open: boolean;
  onClose: (changesSubmitted: boolean) => void;
  preselectedBook?: Book;
}

export const MeetingForm = ({
  currentId,
  open,
  onClose,
  preselectedBook,
}: MeetingFormProps) => {
  const { showError } = useToast();
  const [form, setForm] = useState<MeetingInfo | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { activeClub, members } = useCurrentUserStore();

  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (currentId && activeClub?.docId && isOpen) {
      const scheduledBooks = books?.filter((book) =>
        book.data.scheduledMeetings?.includes(currentId)
      );
      setSelectedBooks(scheduledBooks);
      supabase
        .from('meetings')
        .select('*')
        .eq('id', currentId)
        .single()
        .then(({ data: meeting }) => {
          if (meeting) {
            const hasRemote = Boolean(meeting.remote_link || meeting.remote_password);
            setForm({
              date: meeting.date ?? undefined,
              location: {
                address: meeting.location_address ?? undefined,
                lat: meeting.location_lat ?? undefined,
                lng: meeting.location_lng ?? undefined,
                remoteInfo: hasRemote
                  ? {
                      link: meeting.remote_link ?? undefined,
                      password: meeting.remote_password ?? undefined,
                    }
                  : undefined,
              },
              comments: meeting.comments as unknown as MeetingInfo['comments'],
            });
          }
        });
    }
  }, [activeClub?.docId, books, currentId, isOpen]);

  useEffect(() => {
    if (!preselectedBook) return;
    setSelectedBooks((previousBooks) => {
      if (previousBooks.some((book) => book.docId === preselectedBook.docId)) {
        return previousBooks;
      }
      return [...previousBooks, preselectedBook];
    });
  }, [preselectedBook]);

  useEffect(() => {
    if (selectedDate !== null) {
      setForm((previousForm) => {
        const previousDate = previousForm?.date
          ? new Date(previousForm.date)
          : null;
        if (previousDate && isEqual(selectedDate, previousDate)) {
          return previousForm;
        }
        return {
          ...(previousForm ?? {}),
          date: selectedDate.toISOString(),
        };
      });
      return;
    }
    if (form?.date) {
      setSelectedDate(new Date(form.date));
      return;
    }
    setSelectedDate(addMonths(setHours(setMinutes(new Date(), 0), 19), 1));
  }, [selectedDate, form?.date]);

  const handleClose = (changesSubmitted = false) => {
    onClose(changesSubmitted);
  };

  const setDate = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const onLocationSelect = (e: SelectChangeEvent) => {
    const pickedMemberUid = e.target.value;
    const isRemote = pickedMemberUid === 'remote';

    const pickedMember = isRemote
      ? undefined
      : members?.find((member) => member.data.uid === pickedMemberUid);

    const remoteInfo = isRemote
      ? { link: '', password: '' }
      : undefined;

    if (pickedMember) {
      setForm((previousForm) => ({
        ...(previousForm ?? {}),
        location: {
          user: pickedMember?.data,
        },
      }));
    } else if (remoteInfo) {
      setForm((previousForm) => ({
        ...(previousForm ?? {}),
        location: {
          remoteInfo: remoteInfo,
        },
      }));
    }
  };

  const onBookSelect = (e: React.SyntheticEvent, books: Book[]) => {
    setSelectedBooks(books);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!activeClub) return;

    if (currentId) {
      try {
        const booksToAdd: string[] = [];
        const booksToRemove: string[] = [];

        const scheduledBooks = books.filter((book) =>
          book.data.scheduledMeetings?.includes(currentId)
        );
        scheduledBooks.forEach((scheduledBook) => {
          if (
            scheduledBook.docId &&
            !selectedBooks.some((book) => book.docId === scheduledBook.docId)
          ) {
            booksToRemove.push(scheduledBook.docId);
          }
        });

        selectedBooks.forEach((book) => {
          if (
            book.docId &&
            (!book.data.scheduledMeetings?.length ||
              !book.data.scheduledMeetings.includes(currentId))
          ) {
            booksToAdd.push(book.docId);
          }
        });

        await updateMeeting(
          activeClub.docId,
          currentId,
          form as unknown as Record<string, unknown>
        );

        if (booksToRemove?.length) {
          await updateBookScheduledMeetings(booksToRemove, activeClub.docId, currentId, undefined, true);
        }
        if (booksToAdd?.length) {
          await updateBookScheduledMeetings(booksToAdd, activeClub.docId, currentId, form?.date);
        }
        handleClose(true);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    } else {
      const formDate = form?.date ? (typeof form.date === 'string' ? new Date(form.date) : form.date) : null;
      const meetingExists = meetings.some((meeting) => {
        const mDate = meeting.data.date ? (typeof meeting.data.date === 'string' ? new Date(meeting.data.date) : meeting.data.date) : null;
        return mDate && formDate && isEqual(mDate, formDate);
      });

      if (!meetingExists) {
        const res = await addMeeting(activeClub.docId, {
          ...(form ?? {}),
          location: form?.location as unknown as Record<string, unknown> | undefined,
          comments: form?.comments,
          date: form?.date ?? new Date().toISOString(),
        });

        const booksNotInDb = selectedBooks.filter((book) => !book.docId);
        if (booksNotInDb?.length) {
          for (const book of booksNotInDb) {
            await addBook(activeClub.docId, {
              volumeInfo: book.data.volumeInfo as unknown as Record<string, unknown>,
              id: book.data.id,
              scheduledMeetings: [res.id],
              addedDate: new Date().toISOString(),
              ratings: [],
              progressReports: [],
            });
          }
        }

        const selectedBookIds = selectedBooks.map((book) => book.docId).filter(notEmpty);
        if (selectedBookIds?.length) {
          await updateBookScheduledMeetings(selectedBookIds, activeClub.docId, res.id, form?.date);
        }
        handleClose(true);
      } else {
        showError('A meeting with this date already exists');
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => handleClose()} fullWidth>
      <DialogTitle>
        {`${currentId ? 'Edit' : 'Schedule new'} meeting`}
      </DialogTitle>
      <DialogContent>
        <StyledModalForm>
          <FormControl fullWidth>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={
                form?.location?.remoteInfo
                  ? 'remote'
                  : form?.location?.user?.uid || ''
              }
              label="Location"
              onChange={onLocationSelect}
            >
              {members?.map((member) => (
                <MenuItem key={member.docId} value={member.data.uid}>
                  {member.data.displayName}
                </MenuItem>
              ))}
              <MenuItem value={'remote'}>Remote</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={da}
            >
              <DateTimePicker
                label="Pick date/time"
                onChange={(e) => setDate(e)}
                value={selectedDate}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl>
            {books.every((book) => Boolean(book?.data?.volumeInfo)) ? (
              <Autocomplete
                multiple
                value={selectedBooks || []}
                isOptionEqualToValue={(option, value) =>
                  option.data.id === value.data.id
                }
                getOptionKey={(option) => option?.data?.id ?? option?.docId ?? ''}
                id="tags-standard"
                options={books}
                onChange={onBookSelect}
                getOptionLabel={(option) =>
                  option?.data?.volumeInfo?.title || 'Missing title'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Book candidates"
                    placeholder="Search books"
                  />
                )}
              />
            ) : null}
          </FormControl>
        </StyledModalForm>
      </DialogContent>
      <DialogActions>
        <UIButton
          variant="primary"
          className="focus-ring"
          onClick={(e) => handleSubmit(e)}
        >
          Save
        </UIButton>
        <UIButton
          variant="ghost"
          className="focus-ring"
          onClick={() => handleClose(false)}
        >
          Cancel
        </UIButton>
      </DialogActions>
    </Dialog>
  );
};
