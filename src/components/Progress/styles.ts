import isPropValid from '@emotion/is-prop-valid';
import {
  IconButton,
  IconButtonProps,
  TextField,
  TooltipProps,
  styled,
} from '@mui/material';
import { Reorder } from 'framer-motion';

export const StyledProgressBarList = styled(Reorder.Group)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  display: 'grid',
}));

export const StyledEmptyProgressState = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
  fontStyle: 'italic',
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

export const StyledProgressFullWidthContainer = styled(
  'div'
)<StyledProgressFullWidthContainerProps>(({ theme, progress }) => ({
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

interface StyledMemberNameProps {
  isVisible?: boolean;
}

export const StyledMemberName = styled('span')<StyledMemberNameProps>(
  ({ theme, isVisible = true }) => ({
    whiteSpace: 'nowrap',
    maxWidth: 45,
    display: isVisible ? 'flex' : 'none',
  })
);

export const StyledButtonContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

interface StyledFormProps extends TooltipProps {
  isVisible: boolean;
}

interface StyledIconButtonProps extends IconButtonProps {
  isVisible: boolean;
}

export const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => typeof prop === 'string' && isPropValid(prop),
})<StyledIconButtonProps>(({ theme, isVisible }) => ({
  display: isVisible ? 'flex' : 'none',
  gap: theme.spacing(1),
}));

export const StyledTextField = styled(TextField)(
  ({ theme }) => ({})
) as typeof TextField;

export const StyledPageNumberForm = styled('form', {
  shouldForwardProp: (prop) => typeof prop === 'string' && isPropValid(prop),
})<StyledFormProps>(({ theme, isVisible }) => ({
  display: isVisible ? 'flex' : 'none',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const StyledEditButton = styled('button')(({ theme }) => ({}));

export const StyledProgressBar = styled('div')(({ theme }) => ({
  height: 2,
  position: 'relative',
  flexBasis: '80%',
  backgroundColor: theme.palette.primary.main,
}));

export const StyledProgressBarContainer = styled(Reorder.Item)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(3),
  height: 32,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginBottom: theme.spacing(2),

  div: {
    ':not(:nth-of-type(2))': {
      flex: 1,
    },
  },
}));
