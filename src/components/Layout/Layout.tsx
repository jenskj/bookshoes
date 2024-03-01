import { BottomNavigation, TopNavigation } from '@components';
import { useCurrentUserStore } from '@hooks';
import { useMediaQuery, useTheme } from '@mui/material';
import { StyledPage } from '@pages/styles';
import { Outlet } from 'react-router-dom';
export const Layout = () => {
  const { activeClub } = useCurrentUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      {!isMobile ? <TopNavigation /> : null}
      <StyledPage>
        <Outlet />
      </StyledPage>
      {isMobile && activeClub ? <BottomNavigation /> : null}
    </>
  );
};
