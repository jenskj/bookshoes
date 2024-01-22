import { DialogContent, styled } from '@mui/material';

export const StyledBookCard = styled('div')(({ theme }) => ({
  borderRadius: 5,
  position: 'relative',
  display: 'flex',
  backgroundColor: theme.palette.primary.main,
  flexDirection: 'column',
  ':hover': {
    cursor: 'pointer',
  },
}));
export const StyledBookInfoContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: '1fr',
}));

export const StyledBookInfoTop = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const StyledBookInfoBottom = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

export const StyledBookCoverContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  alignItems: 'center',
  display: 'flex',
  flex: 2,
}));

export const StyledBookCover = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
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
  minHeight: 200,
}));
export const StyledBookInfoCard = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

export const StyledBookDetails = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
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
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: 5,

  svg: {
    color: theme.palette.primary.main,
  },
}));

export const StyledBookStatusDetails = styled('div')(({ theme }) => ({
  display: 'grid',
  backgroundColor: theme.palette.primary.main,
}));

export const StyledHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  marginBottom: theme.spacing(2),
}));

export const StyledTitle = styled('h3')(({ theme }) => ({
  textAlign: 'center',
  width: '100%',
}));

export const StyledHr = styled('hr')(({ theme }) => ({
  border: 'none',
  height: 1,
  backgroundColor: 'white',
  width: '100%',
  margin: `${theme.spacing(0.5)} 0`,
}));

export const StyledAuthor = styled('div')(({ theme }) => ({
  span: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export const StyledInfoList = styled('div')(({ theme }) => ({}));
export const StyledSection = styled('div')(({ theme }) => ({
  ':not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
}));
export const StyledSectionTitle = styled('h3')(({ theme }) => ({}));
