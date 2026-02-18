import { createTheme, PaletteMode } from '@mui/material/styles';
import type { ThemeAccentPreset } from '@types';

type AccentTokens = {
  primary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
};

const ACCENT_BY_PRESET: Record<ThemeAccentPreset, AccentTokens> = {
  classic: {
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
  },
  forest: {
    primary: {
      light: '#9fc9ac',
      main: '#4d7f5c',
      dark: '#2f5b3f',
      contrastText: '#f2f7f2',
    },
    secondary: {
      light: '#e3d68e',
      main: '#b8a649',
      dark: '#8f7d28',
      contrastText: '#12130f',
    },
  },
  rose: {
    primary: {
      light: '#f2bbc6',
      main: '#da8699',
      dark: '#b16376',
      contrastText: '#1a0f13',
    },
    secondary: {
      light: '#c9d3e8',
      main: '#95aacf',
      dark: '#6f84aa',
      contrastText: '#0f1420',
    },
  },
};

export const createAppTheme = (
  mode: PaletteMode,
  accentPreset: ThemeAccentPreset
) => {
  const accent = ACCENT_BY_PRESET[accentPreset];

  return createTheme({
    palette: {
      mode,
      primary: accent.primary,
      secondary: accent.secondary,
      background:
        mode === 'dark'
          ? {
              default: '#0b0f15',
              paper: '#1b2331',
            }
          : {
              default: '#f8f5ee',
              paper: '#ffffff',
            },
      text:
        mode === 'dark'
          ? {
              primary: '#f3efe4',
              secondary: '#c7c1b3',
            }
          : {
              primary: '#18140f',
              secondary: '#5d5648',
            },
      divider: mode === 'dark' ? '#3a4459' : '#d7d0c3',
      action:
        mode === 'dark'
          ? {
              hover: 'rgba(255, 255, 255, 0.08)',
              selected: 'rgba(203, 189, 102, 0.16)',
            }
          : {
              hover: 'rgba(0, 0, 0, 0.04)',
              selected: 'rgba(77, 127, 92, 0.14)',
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
};
