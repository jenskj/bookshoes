import { DialogContent, styled } from '@mui/material';

export const StyledBookCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: 5,
  position: 'relative',
}));

export const StyledBookCover = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
}));

export const StyledBookDetailsHeader = styled('div')(({ theme }) => ({
  textAlign: 'center',
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const StyledBookBanner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const StyledBookTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledBookAuthor = styled('div')(() => ({
  fontSize: '1rem',
  color: '#666',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledBookDescriptionContainer = styled('div')(() => ({}));
export const StyledBookDescription = styled('div')(() => ({
  fontSize: '1rem',
  color: '#666',
}));

export const StyledBookStatusIcon = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(6),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: 5,

  svg: {
    color: theme.palette.primary.main,
  },
}));
