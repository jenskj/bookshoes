import { Outlet } from "react-router-dom";
import { StyledLink, StyledNavigation, StyledNavigationList, StyledNavigationListItem, StyledPage } from "./styles";
export const Layout = () => {
  return (
    <>
      <StyledNavigation>
        <StyledNavigationList>
          <StyledNavigationListItem>
            <StyledLink to="/">Home</StyledLink>
          </StyledNavigationListItem>
          <StyledNavigationListItem>
            <StyledLink to="/meetings">Meetings</StyledLink>
          </StyledNavigationListItem>
          <StyledNavigationListItem>
            <StyledLink to="/books">Books</StyledLink>
          </StyledNavigationListItem>
        </StyledNavigationList>
      </StyledNavigation>
      <StyledPage>
        <Outlet />
      </StyledPage>
    </>
  );
};
