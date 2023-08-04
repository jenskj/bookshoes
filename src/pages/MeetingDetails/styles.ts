import styled from '@emotion/styled';

export const StyledBooksBanner = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
  gridAutoFlow: 'column',
  gridAutoColumns: '(minmax(160px,1fr))',
  gridGap: '1rem',
}));
