import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#FFD700',
      main: '#DAA520',
      dark: '#B8860B',
      contrastText: '#000000',
    },
    secondary: {
      light: '#C1FFC1',
      main: '#8FBC8F',
      dark: '#698B69',
      contrastText: '#000000',
    },
  },
});

export default theme;
