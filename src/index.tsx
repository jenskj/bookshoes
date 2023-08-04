import React from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme,
} from '@mui/material/styles';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import App from './App';
import { mainTheme } from './theme';
import theme from './muitheme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={mainTheme}>
      <App />
    </ThemeProvider>
  </MuiThemeProvider>
);