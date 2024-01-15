import { styled } from '@mui/material';

export const StyledHeader = styled('header')(({ theme }) => ({
  padding: `${theme.spacing(1 / 2)} ${theme.spacing(1)}`,
}));

export const StyledOverflowContainer = styled('div')(({ theme }) => ({
  height: `calc(40px - (${theme.spacing(1)} / 2))`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  overflow: 'hidden',

  [theme.breakpoints.up('md')]: {
    height: `calc(50px - (${theme.spacing(1)} / 2))`,
  },
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
  fontSize: `clamp(${theme.typography.fontSize}, 2.5vw, ${theme.typography.h1.fontSize})`,
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
