import { styled } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';

const StyledTopNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 2),
  marginBottom: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  border: `1px solid transparent`,
  borderRadius: 4,
  padding: theme.spacing(0.5, 1.2),
  color: theme.palette.text.secondary,
  fontSize: '0.86rem',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  transition: 'all 150ms ease',
  '&.active': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.light,
    backgroundColor: 'rgba(197, 183, 88, 0.08)',
  },
  '&:hover': {
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
  },
}));

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Meetings', to: '/meetings' },
  { label: 'Library', to: '/books' },
  { label: 'Clubs', to: '/clubs' },
];

export const TopNavigation = () => {
  return (
    <StyledTopNav>
      {NAV_ITEMS.map((item) => (
        <StyledNavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className="focus-ring"
        >
          {item.label}
        </StyledNavLink>
      ))}
    </StyledTopNav>
  );
};
