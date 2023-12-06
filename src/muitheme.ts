import { createTheme } from '@mui/material';
import { Theme, ThemeOptions } from '@mui/material';

declare module '@mui/material' {
  interface CustomTheme extends Theme {
    border: {
      main: string;
    };
    sizes: {
      header: {
        height: number;
      };
      title: {
        height: number;
      };
    };
  }
  // allow configuration using `createTheme`
  interface CustomThemeOptions extends ThemeOptions {
    border?: {
      main?: string;
    };
    sizes?: {
      header?: {
        height?: number;
      };
      title?: {
        height?: number;
      };
    };
  }
  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}

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
      dark: '#337a33',
      contrastText: '#000000',
    },
    background: { default: '#383636' },
  },
  typography: {
    h2: { fontSize: '1.4rem', fontWeight: 'bold' },
    h3: { fontSize: '1.2  rem' },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 450,
      md: 768,
      lg: 1024,
      xl: 1200,
    },
  },
  // Custom properties
  // Not working in styled components currently...
  border: { main: '1px solid black' }, 
  sizes: { header: { height: 50 }, title: { height: 38.4 } },
});

export default theme;
