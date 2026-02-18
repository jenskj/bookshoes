import { styled } from '@mui/material';
import { UIButton } from '@components/ui';

export const StyledSwiperNavigation = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  alignItems: 'stretch',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

interface StyledNavigationButtonProps {
  isActive: boolean;
}

export const StyledNavigationButton = styled(UIButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<StyledNavigationButtonProps>(({ theme, isActive }) => ({
  width: '100%',
  minHeight: 36,
  padding: theme.spacing(0.7, 1.4),
  whiteSpace: 'nowrap',
  borderColor: isActive ? theme.palette.primary.main : theme.palette.divider,
  color: isActive ? theme.palette.primary.light : theme.palette.text.secondary,
  backgroundColor: isActive ? 'rgba(197, 183, 88, 0.12)' : 'transparent',
}));
