import {
    CalendarMonthRounded,
    MenuBookRounded,
    PeopleAltRounded
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const StyledBottomNavigation = () => {
  const [value, setValue] = useState<number | null>(null);
  const theme = useTheme();
  const location = useLocation();

  const navigationItems = useMemo(
    () => [
      {
        label: 'Meetings',
        icon: <CalendarMonthRounded />,
        path: '/meetings',
      },
      {
        label: 'Books',
        icon: <MenuBookRounded />,
        path: '/books',
      },
      {
        label: 'Clubs',
        icon: <PeopleAltRounded />,
        path: '/clubs',
      },
    ],
    []
  );

  useEffect(() => {
    if (location.pathname) {
      const path = location.pathname.split('/')[1];
      const index = navigationItems.findIndex(
        (item) => item.path.split('/')[1] === path
      );

      setValue(index);
    }
  }, [location, value, navigationItems]);
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: theme.spacing(1),
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        height: theme.spacing(6),
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            component={Link}
            to={item.path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
