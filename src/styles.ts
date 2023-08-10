import { styled } from "@mui/material";

export const StyledHeader = styled('header')(({theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.primary.main
}));
