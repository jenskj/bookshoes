import { ThemeProvider } from '@emotion/react';
import {
  ThemeProvider as MuiThemeProvider
} from '@mui/material/styles';
import ReactDOM from 'react-dom/client';
import App from './App';
import theme from './muitheme';
import { mainTheme } from './theme';

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