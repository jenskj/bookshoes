import { styled } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export const StyledPreviewButtonContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface StyledArrowIconProps {
  direction: 'horizontal' | 'vertical';
}
export const StyledArrowIcon = styled(
  ArrowBackIosNewIcon
)<StyledArrowIconProps>(({ theme, direction }) => ({
  transform: `rotate(${direction === 'horizontal' ? '180' : '-90'}deg)`,
}));
