import { BottomNavigation, ClubContextBar, TopNavigation } from '@components';
import { useMediaQuery, useTheme } from '@mui/material';
import { StyledPage } from '@pages/styles';
import { Outlet } from 'react-router-dom';
export const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      {!isMobile ? <TopNavigation /> : null}
      <StyledPage>
        <ClubContextBar />
        <Outlet />
      </StyledPage>
      {isMobile ? <BottomNavigation /> : null}
    </>
  );
};
