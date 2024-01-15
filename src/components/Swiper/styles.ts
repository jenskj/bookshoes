import { Button, styled } from '@mui/material';

export const StyledSwiperNavigation = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const StyledNavigationButton = styled(Button)(({ theme }) => ({
  padding: `${theme.spacing(1)}} ${theme.spacing(2)}`,
}));
