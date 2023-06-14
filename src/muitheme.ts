import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: { main: '#6E9E60' },
    secondary: { main: '#33bd0a' },
  },
  spacing: [4, 8, 16, 32, 64, 74],
});

export default theme;
