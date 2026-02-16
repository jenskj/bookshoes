import { Snackbar, Alert, AlertColor } from '@mui/material';
import { createContext, useCallback, useContext, useState } from 'react';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback((message: string, severity: AlertColor) => {
    setState({ open: true, message, severity });
  }, []);

  const showError = useCallback((message: string) => show(message, 'error'), [show]);
  const showSuccess = useCallback((message: string) => show(message, 'success'), [show]);
  const showInfo = useCallback((message: string) => show(message, 'info'), [show]);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={state.severity} variant="filled">
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showError: (msg: string) => console.error(msg),
      showSuccess: () => {},
      showInfo: () => {},
    };
  }
  return ctx;
}
