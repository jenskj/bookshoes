import { styled } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export const StyledPreviewButtonContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const StyledLinkContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));
export const StyledLinkTitle = styled('div')(({ theme }) => ({}));

interface StyledArrowIconProps {
  direction: 'horizontal' | 'vertical';
}
export const StyledArrowIcon = styled(
  ArrowBackIosNewIcon
)<StyledArrowIconProps>(({ theme, direction }) => ({
  transform: `rotate(${direction === 'horizontal' ? '180' : '-90'}deg)`,
}));
