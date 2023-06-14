import styled from '@emotion/styled';
import { StyledResetButton } from '../../shared/styles';

export const StyledNavigationButton = styled(StyledResetButton)(({ theme }) => ({
  display: 'block',
  padding: '1rem',
  marginLeft: 'auto',
  marginRight: 0,
}));
