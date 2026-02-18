import { Button, styled } from '@mui/material';

export const StyledSwiperNavigation = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  alignItems: 'stretch',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const StyledNavigationButton = styled(Button)(({ theme }) => ({
  width: '100%',
  minHeight: 36,
  padding: theme.spacing(0.7, 1.4),
  whiteSpace: 'nowrap',
}));
