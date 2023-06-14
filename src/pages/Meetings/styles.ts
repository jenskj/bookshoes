import styled from '@emotion/styled';
import { StyledResetButton } from '../../shared/styles';

export const StyledMeetingList = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'repeat(3, 150px)',
  padding: theme.spacing[1],
  gap: theme.spacing[0],
  position: 'relative',
}));

export const StyledMeeting = styled.div(({ theme }) => ({
  background: 'blue',
}));

export const StyledAddNewButton: any = styled(StyledResetButton)(
  ({ theme }) => ({
    backgroundColor: 'green',
    padding: `${theme.spacing[0]}px ${theme.spacing[1]}px`,
    position: 'fixed',
    top: `calc(100vh - ${theme.spacing[6]}px)`,
    right: theme.spacing[4],
    fontSize: 34,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 3,
  })
);

export const StyledMeetingForm = styled.form(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing[2],
}));

export const StyledMeetingFormHeader = styled.h2(({ theme }) => ({}));

export const StyledMeetingHeader = styled.h2(({ theme }) => ({}));

export const StyledSubmit = styled(StyledResetButton)(({ theme }) => ({
  marginTop: theme.spacing[2],
}));
