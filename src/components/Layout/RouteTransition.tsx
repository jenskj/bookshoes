import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { StyledRouteTransition } from './styles';

interface RouteTransitionProps extends PropsWithChildren {
  transitionKey?: string;
}

export const RouteTransition = ({
  children,
  transitionKey,
}: RouteTransitionProps) => {
  const location = useLocation();
  const key = transitionKey ?? location.pathname;

  return (
    <StyledRouteTransition key={key} className="fade-up">
      {children}
    </StyledRouteTransition>
  );
};
