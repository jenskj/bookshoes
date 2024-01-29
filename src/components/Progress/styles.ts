import { TextField, Tooltip, styled } from '@mui/material';

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
  minWidth: 45,
}));

interface StyledEditProps {
  isVisible: boolean;
}

export const StyledToolTip: any = styled(Tooltip)<StyledEditProps>(
  ({ theme, isVisible }) => ({
    display: isVisible ? 'flex' : 'none',
  })
);

export const StyledTextField: any = styled(TextField)(({ theme }) => ({}));

export const StyledPageNumberForm = styled('form')<StyledEditProps>(
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
