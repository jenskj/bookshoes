import { Theme, ThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material/styles';

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
      light: 'hsl(50, 60%, 65%)',
      main: '#c5b758',
      dark: 'hsl(50, 60%, 35%)',
      contrastText: '#000000',
    },
    secondary: {
      light: 'hsl(120, 50%, 40%)',
      main: 'hsl(120, 60%, 30%)',
      dark: 'hsl(120, 60%, 25%)',
      contrastText: '#000000',
    },
    background: { default: 'hsl(200, 60%, 96%)' },
  },
  // generate a better color palette, please :(
  // https://material-ui.com/customization/color/#color-tool
  typography: {
    h2: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      fontFamily: "'Raleway', Verdana, Geneva, Tahoma, sans-serif",
    },
    h3: {
      fontSize: '1.2  rem',
      fontFamily: "'Raleway', Verdana, Geneva, Tahoma, sans-serif",
    },
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
