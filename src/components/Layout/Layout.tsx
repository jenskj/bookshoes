import React from 'react';
import { Outlet } from 'react-router-dom';
import { StyledLink, StyledNavigation, StyledPage } from './styles';
export const Layout = () => {
  return (
    <>
      <StyledNavigation>
        <StyledLink to="/">Home</StyledLink>
        <StyledLink to="/meetings">Meetings</StyledLink>
        <StyledLink to="/books">Books</StyledLink>
      </StyledNavigation>
      <StyledPage>
        <Outlet />
      </StyledPage>
    </>
  );
};
