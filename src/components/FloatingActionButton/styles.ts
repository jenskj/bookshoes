import { Fab, styled } from '@mui/material';
import { motion } from 'framer-motion';

interface StyledFloatingActionButtonProps {
  optionNumber?: number;
}

export const StyledFloatingActionButton = styled(
  motion(Fab)
)<StyledFloatingActionButtonProps>(({ theme, variant, optionNumber = 1 }) => ({
  opacity: optionNumber > 1 ? 0 : 1,
  position: 'sticky',
  backgroundColor: theme.palette.secondary.dark,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginRight: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: 'white',
  fontWeight: 'bold',
  top: `calc(100% - ${theme.spacing(15 * optionNumber)})`,
  pointerEvents: 'auto',
  transition:
    'max-width 0.2s ease,min-width 0.2s ease, height 0.2s ease, border-radius 0.2s ease',
  maxWidth: `${variant === 'extended' ? '185px' : '56px'} !important`,
  minWidth: `${variant === 'extended' ? '185px' : '56px'} !important`,

  [theme.breakpoints.up('md')]: {
    top: `calc(100% - ${theme.spacing(9 * optionNumber)})`,
  },
}));

export const StyledFabOption = styled('div')(({ theme }) => ({}));

interface StyledFabTextProps {
  isVisible: boolean;
}

export const StyledFabText = styled('span')<StyledFabTextProps>(
  ({ theme, isVisible }) => ({
    opacity: isVisible ? 1 : 0,
    transition: isVisible ? 'opacity 0.2s ease 0.2s' : 'unset',
    position: isVisible ? 'relative' : 'absolute',
  })
);

interface StyledFabWrapperProps {
  optionsOpen: boolean;
}

export const StyledFabWrapper = styled('div')<StyledFabWrapperProps>(
  ({ theme, optionsOpen }) => ({
    display: 'grid',
    gap: theme.spacing(3),
    position: 'absolute',
    pointerEvents: optionsOpen ? 'unset' : 'none',
    maxWidth: 200,
    top: 0,
    bottom: 0,
    right: 0,
  })
);
