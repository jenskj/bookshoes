import { DialogContent, styled } from '@mui/material';

export const StyledBookCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: 5,
  position: 'relative',
}));

export const StyledBookCover = styled('img')(({ theme }) => ({
  width: '100%',
  height: '80%',
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
  bottom: theme.spacing(7),
  right: theme.spacing(0.5),
  backgroundColor: theme.palette.background.default,
  borderRadius: 5,

  svg: {
    color: theme.palette.primary.main,
  },
}));

export const StyledBookStatusDetails = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  backgroundColor: theme.palette.primary.main,
}));

export const StyledBookStatusCard = styled('table')(({ theme }) => ({
  tableLayout: 'fixed',
}));

export const StyledCardHeader = styled('h3')(({ theme }) => ({
  textAlign: 'center',
  width: '100%',
}));

export const StyledInfoTable = styled('table')(({ theme }) => ({}));
export const StyledTableHeader = styled('th')(({ theme }) => ({}));

interface StyledTableDataProps {
  containerWidth: number;
}
export const StyledTableData = styled('td')<StyledTableDataProps>(
  ({ theme, containerWidth }) => ({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: `calc(${containerWidth}px / 3)`, // this should be tweaked a bit. Neat idea though...

    [theme.breakpoints.up('md')]: {
      maxWidth: 786,
    },
  })
);