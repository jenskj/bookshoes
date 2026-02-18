import { styled } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';

const StyledBottomDock = styled('nav')(({ theme }) => ({
  position: 'fixed',
  left: theme.spacing(1.5),
  right: theme.spacing(1.5),
  bottom: theme.spacing(1.5),
  zIndex: theme.zIndex.appBar,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'rgba(14, 17, 24, 0.9)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 16px 34px rgba(0, 0, 0, 0.4)',
  overflow: 'hidden',
}));

const StyledBottomLink = styled(NavLink)(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  minHeight: 52,
  color: theme.palette.text.secondary,
  fontSize: '0.73rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:last-of-type': {
    borderRight: 'none',
  },
  '&.active': {
    color: theme.palette.primary.light,
    background:
      'linear-gradient(180deg, rgba(197, 183, 88, 0.1) 0%, rgba(197, 183, 88, 0.02) 100%)',
  },
}));

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Meet', to: '/meetings' },
  { label: 'Books', to: '/books' },
  { label: 'Clubs', to: '/clubs' },
];

export const BottomNavigation = () => {
  return (
    <StyledBottomDock aria-label="Primary navigation">
      {NAV_ITEMS.map((item) => (
        <StyledBottomLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className="focus-ring"
        >
          {item.label}
        </StyledBottomLink>
      ))}
    </StyledBottomDock>
  );
};
