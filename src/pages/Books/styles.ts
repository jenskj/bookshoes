import { styled } from '@mui/material/styles';
import { StyledResetButton } from '@shared/styles';

export const StyledBookContainer = styled('div')(({ theme }) => ({
  margin: '0 auto',
  borderRadius: 4,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gridGap: '1rem',
}));

export const StyledModalCloseButton = styled('button')(({ theme }) => ({
  padding: '0.5rem',
  backgroundColor: 'white',
  fontSize: '1rem',
  position: 'absolute',
  left: theme.spacing(1),
}));

export const StyledModalHeader = styled('header')(({ theme }) => ({
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0),
}));

export const StyledModalHeaderTop = styled('div')(({ theme }) => ({
  width: '100%',
}));

export const StyledBookStatus = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing(2),
}));

type StyledSearchFormProps = {
  isActive?: boolean;
};

export const StyledSearchForm = styled('form')<StyledSearchFormProps>(
  ({ isActive }) => ({
    position: 'relative',
    '> input': {
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: '0 1rem',
      outline: 0,
      margin: -3,
      left: 3,
    },

    // transition: 'all 1s linear',
    // transform: `translateX(${isActive ? 0 : '-100%'})`,
  })
);

export const StyledSearchButton = styled(StyledResetButton)(({ theme }) => ({
  position: 'absolute',
  top: '25%',
  right: theme.spacing(-1),
}));

export const StyledBookshelfTop = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const StyledTopLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledStatusSelect = styled('select')(({ theme }) => ({
  display: 'flex',
}));
