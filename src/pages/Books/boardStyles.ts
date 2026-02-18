import { styled } from '@mui/material/styles';
import { UICard, UIButton, UIInput } from '@components/ui';

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

export const StyledLane = styled(UICard)(({ theme }) => ({
  minHeight: 180,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
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

export const StyledBookTile = styled(UICard)(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '60px 1fr',
  gap: theme.spacing(0.8),
  padding: theme.spacing(0.7),
  borderRadius: 8,
  backgroundColor: '#111621',
  cursor: 'grab',
  ':hover': {
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

export const StyledMoveButton = styled(UIButton)(({ theme }) => ({
  padding: theme.spacing(0.2, 0.45),
  fontSize: '0.68rem',
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

export const StyledDiscoverPanel = styled(UICard)(({ theme }) => ({
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

export const StyledSearchInput = styled(UIInput)(({ theme }) => ({
  padding: theme.spacing(0.75, 0.85),
}));

export const StyledSearchButton = styled(UIButton)(() => ({}));

export const StyledResultGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.8),
  maxHeight: 560,
  overflowY: 'auto',
}));

export const StyledResultCard = styled(UICard)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '56px 1fr auto',
  gap: theme.spacing(0.8),
  borderRadius: 8,
  backgroundColor: '#111621',
  padding: theme.spacing(0.55),
  alignItems: 'center',
}));

export const StyledResultAction = styled(UIButton)(() => ({}));
