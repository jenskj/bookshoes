import { styled } from '@mui/material';

export const StyledAppContainer = styled('div')(({ theme }) => ({
  maxWidth: theme.breakpoints.values.lg,
  height: '100%',
  backgroundColor: theme.palette.secondary.main,
  margin: 'auto',
}));

export const StyledHeader = styled('header')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  border: '1px solid black',
  padding: theme.spacing(1 / 2),
}));

export const StyledOverflowContainer = styled('div')(({ theme }) => ({
  height: `calc(50px - (${theme.spacing(1)} / 2))`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  overflow: 'hidden',
}));

interface StyledHeaderContainerProps {
  activeClub: boolean;
}
export const StyledHeaderContainer = styled('div')<StyledHeaderContainerProps>(
  ({ theme, activeClub = false }) => ({
    display: 'grid',
    transition: 'transform 200ms ease-in-out',
    transform: `translate3d(0, ${activeClub ? '' : '-'}20px, 0)`,
  })
);
const StyledH1 = styled('h1')(({ theme }) => ({
  height: 40,
}));

export const StyledInactiveHeader = styled(StyledH1)(({ theme }) => ({}));
export const StyledActiveHeader = styled(StyledH1)(({ theme }) => ({}));

export const StyledLogo = styled('div')(({ theme }) => ({
  height: '100%',
  objectFit: 'cover',
  display: 'flex',
  alignItems: 'center',
  img: {
    height: '100%',
    marginRight: theme.spacing(1),
    border: '1px solid black', // consider making into variable
  },
}));
