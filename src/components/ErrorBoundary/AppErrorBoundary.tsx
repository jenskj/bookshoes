import { Component, ErrorInfo, ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

type AppErrorBoundaryState = {
  hasError: boolean;
};

interface AppErrorBoundaryProps {
  children: ReactNode;
}

const StyledErrorFallback = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: 10,
}));

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <StyledErrorFallback className="surface">
          <h2>Something went wrong</h2>
          <p>Try refreshing the page. If this keeps happening, return to Home.</p>
          <Link to="/home" className="focus-ring">
            Go to dashboard
          </Link>
        </StyledErrorFallback>
      );
    }

    return this.props.children;
  }
}
