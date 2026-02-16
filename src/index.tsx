import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import ReactDOM from 'react-dom/client';
import App from './App';
import theme from './muitheme';
import { ToastProvider } from './lib/ToastContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <MuiThemeProvider theme={theme}>
    <ToastProvider>
      <App />
    </ToastProvider>
  </MuiThemeProvider>
);
