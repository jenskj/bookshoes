import { TextField, Tooltip, TooltipProps, styled } from '@mui/material';
import isPropValid from '@emotion/is-prop-valid'

export const StyledProgressBarList = styled('ul')(({ theme }) => ({
  display: 'grid',
}));

export const StyledProgressPin = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}));

interface StyledProgressFullWidthContainerProps {
  progress: number;
}

export const StyledProgressFullWidthContainer = styled('div', {
  name: 'StyledProgressFullWidthContainer',
})<StyledProgressFullWidthContainerProps>(({ theme, progress }) => ({
  width: '100%',
  height: 2,
  position: 'relative',
  transition: 'transform 200ms ease-in-out',
  transform: `translate(${-50 + progress}%, -50%)`,
}));

export const StyledPercentage = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: theme.typography.fontSize / 1.2,
  fontWeight: 'bold',
}));

export const StyledEditContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  minWidth: 68,
  [theme.breakpoints.up('md')]: {
    minWidth: 91,
  },
  padding: theme.spacing(1),
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}));

export const StyledMemberName = styled('span')(({ theme }) => ({
  whiteSpace: 'nowrap',
  maxWidth: 45,
}));

interface StyledEditProps extends TooltipProps {
  isVisible: boolean;
}

export const StyledToolTip = styled(Tooltip, {
  shouldForwardProp: prop => typeof prop === "string" && isPropValid(prop)
})<StyledEditProps>(
  ({ theme, isVisible }) => ({
    display: isVisible ? 'flex' : 'none',
  })
);

export const StyledTextField = styled(TextField)(({ theme }) => ({})) as typeof TextField;

export const StyledPageNumberForm = styled('form', {
  shouldForwardProp: prop => typeof prop === "string" && isPropValid(prop)
})<StyledEditProps>(
  ({ theme, isVisible }) => ({
    display: isVisible ? 'flex' : 'none',
    alignItems: 'center',
    gap: theme.spacing(1),
  })
);

export const StyledEditButton = styled('button')(({ theme }) => ({}));

export const StyledProgressBar = styled('div')(({ theme }) => ({
  height: 2,
  position: 'relative',
  width: '100%',
  backgroundColor: theme.palette.primary.main,
}));

export const StyledProgressBarContainer = styled('li')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(3),
  height: 32,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginBottom: theme.spacing(2),
}));
