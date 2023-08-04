import styled from '@emotion/styled';
import { StyledResetButton } from '../../shared/styles';

export const StyledMeetingList = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'repeat(3, 150px)',
  padding: theme.spaces[1],
  gap: theme.spaces[0],
  position: 'relative',
}));

export const StyledMeeting = styled.div(({ theme }) => ({
  background: 'blue',
}));

export const StyledAddNewButton: any = styled(StyledResetButton)(
  ({ theme }) => ({
    backgroundColor: 'green',
    padding: `${theme.spaces[0]}px ${theme.spaces[1]}px`,
    position: 'fixed',
    top: `calc(100vh - ${theme.spaces[6]}px)`,
    right: theme.spaces[4],
    fontSize: 34,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 3,
  })
);

export const StyledMeetingForm = styled.form(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spaces[2],
}));

export const StyledMeetingFormHeader = styled.h2(({ theme }) => ({}));

export const StyledMeetingHeader = styled.h2(({ theme }) => ({}));

export const StyledSubmit = styled(StyledResetButton)(({ theme }) => ({
  marginTop: theme.spaces[2],
}));
