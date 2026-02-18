import ReactDOM from 'react-dom/client';
import App from './App';
import { AppThemeProvider } from './AppThemeProvider';
import { ToastProvider } from './lib/ToastContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AppThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppThemeProvider>
);
