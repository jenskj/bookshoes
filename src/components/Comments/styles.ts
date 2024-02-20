import { Button, styled } from '@mui/material';

export const StyledCommentSection = styled('div')(({ theme }) => ({
  display: 'grid',
  padding: theme.spacing(2),
  borderRadius: '10px',
  gap: theme.spacing(2),
}));

export const StyledCommentList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  borderRadius: '10px',
}));

export const StyledComment = styled('div')(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: '10px',
  gap: theme.spacing(1),
}));

export const StyledCommentContent = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  width: '100%',
}));

export const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  '> *': {
    padding: theme.spacing(0.5),
  },
}));

export const StyledCommentInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const StyledCommentSourceDetails = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

export const StyledDate = styled('span')(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
}));

export const StyledName = styled('h4')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledTitle = styled('h3')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledCommentText = styled('p')(({ theme }) => ({}));

export const StyledAddCommentForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

export const StyledCancelButton = styled('div')(({ theme }) => ({}));

export const StyledTextContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  borderRadius: '10px',
}));

export const StyledPostButton = styled(Button)(({ theme }) => ({
  width: '200px',
  margin: 'auto',
}));
