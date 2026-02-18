import { styled } from '@mui/material/styles';
import { UIButton, UIInput, UITextarea } from '@components/ui';

export const StyledCommentSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const StyledCommentList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledComment = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '36px 1fr',
  gap: theme.spacing(1),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  padding: theme.spacing(1),
}));

export const StyledCommentAvatar = styled('div')(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: 'rgba(197, 183, 88, 0.15)',
  display: 'grid',
  placeItems: 'center',
  fontSize: '0.73rem',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: theme.palette.primary.light,
}));

export const StyledCommentContent = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.6),
}));

export const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.6),
  justifyContent: 'flex-end',
}));

export const StyledActionButton = styled(UIButton)(({ theme }) => ({
  padding: theme.spacing(0.28, 0.5),
  fontSize: '0.73rem',
}));

export const StyledCommentInfo = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: theme.spacing(1),
}));

export const StyledCommentSourceDetails = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.2),
}));

export const StyledDate = styled('span')(({ theme }) => ({
  fontSize: '0.72rem',
  color: theme.palette.text.secondary,
  fontFamily: "'JetBrains Mono', monospace",
}));

export const StyledName = styled('strong')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.88rem',
}));

export const StyledTitle = styled('h3')(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.primary.light,
}));

export const StyledCitation = styled('p')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.72rem',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}));

export const StyledCommentText = styled('p')(({ theme }) => ({
  color: theme.palette.text.primary,
  lineHeight: 1.45,
}));

export const StyledSpoiler = styled(UIButton)(({ theme }) => ({
  borderRadius: 6,
  backgroundColor: 'rgba(20, 25, 34, 0.8)',
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.8, 1),
  textAlign: 'left',
  transition: 'none',
  opacity: 0.82,
  ':hover': {
    opacity: 1,
    borderColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
  },
}));

export const StyledAddCommentForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  padding: theme.spacing(1.2),
}));

export const StyledTextContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.8),
}));

export const StyledFormRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.8),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 160px',
  },
}));

export const StyledLabel = styled('label')(({ theme }) => ({
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: theme.palette.text.secondary,
  display: 'grid',
  gap: theme.spacing(0.35),
}));

export const StyledInput = styled(UIInput)(({ theme }) => ({
  padding: theme.spacing(0.65, 0.8),
}));

export const StyledTextarea = styled(UITextarea)(({ theme }) => ({
  padding: theme.spacing(0.7, 0.8),
}));

export const StyledCheckboxRow = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: '0.82rem',
}));

export const StyledPostButton = styled(UIButton)(({ theme }) => ({
  justifySelf: 'end',
  color: '#111418',
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(0.6, 1.2),
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.72rem',
  transition: 'none',
  ':hover': {
    filter: 'brightness(1.05)',
  },
}));
