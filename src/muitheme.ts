import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#e3d68e',
      main: '#cbbd66',
      dark: '#988d48',
      contrastText: '#0f1218',
    },
    secondary: {
      light: '#6f9e80',
      main: '#4d7f5c',
      dark: '#346145',
      contrastText: '#edf2eb',
    },
    background: {
      default: '#0b0f15',
      paper: '#1b2331',
    },
    text: {
      primary: '#f3efe4',
      secondary: '#c7c1b3',
    },
    divider: '#3a4459',
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(203, 189, 102, 0.16)',
    },
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
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
      },
      styleOverrides: {
        root: {
          transition: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'none',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          transition: 'none',
        },
      },
    },
  },
});

export default theme;
