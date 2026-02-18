import { alpha, styled } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS } from './navConfig';

const StyledBottomDock = styled('nav')(({ theme }) => ({
  position: 'fixed',
  left: theme.spacing(1.5),
  right: theme.spacing(1.5),
  bottom: theme.spacing(1.5),
  zIndex: theme.zIndex.appBar,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  boxShadow:
    '0 18px 36px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
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
      `linear-gradient(
        180deg,
        ${alpha(theme.palette.primary.main, 0.18)} 0%,
        ${alpha(theme.palette.primary.main, 0.06)} 100%
      )`,
  },
}));

export const BottomNavigation = () => {
  return (
    <StyledBottomDock aria-label="Primary navigation">
      {PRIMARY_NAV_ITEMS.map((item) => (
        <StyledBottomLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className="focus-ring"
        >
          {item.shortLabel}
        </StyledBottomLink>
      ))}
    </StyledBottomDock>
  );
};
