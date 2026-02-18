import { alpha, styled } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS } from './navConfig';

const StyledTopNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 2),
  marginBottom: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
  borderRadius: 10,
  background: `linear-gradient(
    180deg,
    ${alpha(theme.palette.background.paper, 0.96)} 0%,
    ${alpha(theme.palette.background.paper, 0.86)} 100%
  )`,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
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
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
  },
  '&:hover': {
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
  },
}));

export const TopNavigation = () => {
  return (
    <StyledTopNav>
      {PRIMARY_NAV_ITEMS.map((item) => (
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
