import styled from '@emotion/styled';

export const StyledHeader = styled.header(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8, // Does not use theme because it is placed outside ThemeProvider
}));
