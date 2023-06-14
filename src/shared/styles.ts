import styled from '@emotion/styled';

export const StyledResetButton = styled.button({
  border: 'none',
  outline: 'none',
  font: 'inherit',
})

export const StyledButton = styled(StyledResetButton)(({ theme }) => ({
  padding: theme.spacing[1],
  border: '1px solid black',
  color: 'white',
  backgroundColor: theme.colors.primary,
  transition: 'background-color 500ms linear',

  '&:active': {
    backgroundColor: theme.colors.background, // good idea but needs improvement
  },
}));


