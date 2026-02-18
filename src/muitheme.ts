import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#d8cb79',
      main: '#c5b758',
      dark: '#91863f',
      contrastText: '#101115',
    },
    secondary: {
      light: '#5d8e6e',
      main: '#3f6f4e',
      dark: '#2b5037',
      contrastText: '#e9dfcf',
    },
    background: {
      default: '#0f1218',
      paper: '#171b24',
    },
    text: {
      primary: '#f1ecdf',
      secondary: '#b4ae9f',
    },
    divider: '#2a3040',
  },
  typography: {
    fontFamily: "'Hanken Grotesk', 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: 'clamp(1.2rem, 2.4vw, 1.55rem)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      letterSpacing: '0.06em',
      fontWeight: 600,
    },
    caption: {
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.02em',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 820,
      lg: 1180,
      xl: 1400,
    },
  },
  shape: {
    borderRadius: 4,
  },
});

export default theme;
