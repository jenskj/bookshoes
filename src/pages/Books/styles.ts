import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { StyledPageSection } from '@pages/styles';

export const StyledBooks = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledLibraryLayout = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '1.45fr 1fr',
    alignItems: 'start',
  },
}));

export const StyledBoard = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.2),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

export const StyledLane = styled('article')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  minHeight: 180,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
}));

export const StyledLaneHeader = styled('header')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 1.1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  h3: {
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  span: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    color: theme.palette.text.secondary,
  },
}));

export const StyledLaneList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.9),
  padding: theme.spacing(1),
  minHeight: 120,
}));

export const StyledBookTile = styled('article')(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '60px 1fr',
  gap: theme.spacing(0.8),
  padding: theme.spacing(0.7),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#111621',
  cursor: 'grab',
  transition: 'transform 160ms ease, border-color 160ms ease',
  ':hover': {
    transform: 'translateY(-1px)',
    borderColor: theme.palette.primary.main,
  },
  ':active': {
    cursor: 'grabbing',
  },
}));

export const StyledTileBody = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.35),
}));

export const StyledTileTitle = styled('strong')(({ theme }) => ({
  fontSize: '0.87rem',
  lineHeight: 1.24,
  color: theme.palette.text.primary,
}));

export const StyledTileMeta = styled('span')(({ theme }) => ({
  fontSize: '0.74rem',
  color: theme.palette.text.secondary,
}));

export const StyledTileActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
  marginTop: theme.spacing(0.2),
}));

export const StyledMoveButton = styled('button')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  fontSize: '0.68rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  padding: theme.spacing(0.2, 0.45),
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.light,
  },
}));

export const StyledStamp = styled('span')(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(0.4),
  top: theme.spacing(0.4),
  border: `1px solid #8d5a2f`,
  borderRadius: 3,
  padding: '1px 5px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.6rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#d39a67',
  transform: 'rotate(-6deg)',
}));

export const StyledDiscoverPanel = styled('section')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  display: 'grid',
  gap: theme.spacing(1),
  padding: theme.spacing(1.2),
}));

export const StyledSearchRow = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.8),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: '1fr auto',
  },
}));

export const StyledSearchInput = styled('input')(({ theme }) => ({
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#0f131c',
  color: theme.palette.text.primary,
  padding: theme.spacing(0.75, 0.85),
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
}));

export const StyledSearchButton = styled('button')(({ theme }) => ({
  borderRadius: 4,
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: 'rgba(197, 183, 88, 0.14)',
  color: theme.palette.primary.light,
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.72rem',
  padding: theme.spacing(0.65, 1),
  ':hover': {
    color: '#0f1118',
    backgroundColor: theme.palette.primary.main,
  },
}));

export const StyledResultGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.8),
  maxHeight: 560,
  overflowY: 'auto',
}));

export const StyledResultCard = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '56px 1fr auto',
  gap: theme.spacing(0.8),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#111621',
  padding: theme.spacing(0.55),
  alignItems: 'center',
}));

export const StyledResultAction = styled('button')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.68rem',
  padding: theme.spacing(0.3, 0.5),
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.light,
  },
}));

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

export const StyledSearchForm = styled('form')(({ theme }) => ({
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

// BookDetails
export const StyledBookDetails = styled('div')(({ theme }) => ({}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  maxWidth: 200,
}));

export const StyledBookHeaderContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
}));

export const StyledAddButtonContainer = styled('div')(({ theme }) => ({
  display: 'none',
  justifyContent: 'flex-end',
  alignItems: 'center',

  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

export const StyledHeaderContainer = styled('div')(({ theme }) => ({
  justifyContent: 'space-between',
  display: 'flex',
  gap: theme.spacing(1),
  '> *': {
    flex: 1,
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

export const StyledBookDetailsMiddle = styled(StyledPageSection)(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '1fr 1fr',
    },
  })
);
