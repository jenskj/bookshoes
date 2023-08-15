import { styled } from '@mui/material';
import { StyledResetButton } from '../../shared/styles';

export const StyledMeetingList = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'repeat(3, 150px)',
  padding: theme.spacing(1),
  gap: theme.spacing(0),
  position: 'relative',
}));

export const StyledMeeting = styled('div')(({ theme }) => ({
  background: theme.palette.primary.dark,
  borderRadius: 5,
  minHeight: 175,
}));

export const StyledAddNewButtonWrapper: any = styled('div')(({ theme }) => ({
  position: 'fixed',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
}));
export const StyledAddNewButton = styled(StyledResetButton)(
  ({ theme }) => ({
    backgroundColor: 'green',
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    position: 'absolute',
    right: theme.spacing(4),
    fontSize: 34,
    color: 'white',
    bottom: theme.spacing(8),
    fontWeight: 'bold',
    borderRadius: 5,
  })
);

export const StyledMeetingForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const StyledMeetingFormHeader = styled('h2')(({ theme }) => ({}));

export const StyledMeetingHeader = styled('h2')(({ theme }) => ({}));

export const StyledDate = styled('h2')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledLocation = styled('h3')(({ theme }) => ({
  textTransform: 'capitalize',
}));

export const StyledReadingList = styled('h3')(({ theme }) => ({}));
