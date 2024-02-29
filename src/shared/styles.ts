import { styled } from '@mui/material/styles';

// Is this necessary?
export const StyledResetButton = styled('button')({
  border: 'none',
  outline: 'none',
  font: 'inherit',
});

export const StyledButton = styled(StyledResetButton)(({ theme }) => ({
  padding: theme.spacing(1),
  border: '1px solid black',
  color: 'white',
  backgroundColor: theme.palette.primary.main,
  transition: 'background-color 500ms linear',

  '&:active': {
    // backgroundColor: theme.palette.secondary.main, // good idea but needs improvement
  },
}));

export const StyledModalForm = styled('form')(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'grid',
  gap: theme.spacing(3),
}));
