import { supabase } from '@lib/supabase';
import { StyledSignInButton } from './styles';

interface SignInProps {
  label?: string;
}

export const SignIn = ({ label = 'Sign in with Google' }: SignInProps) => {
  const signInWithGoogle = () => {
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
    supabase.auth
      .signInWithOAuth({ provider: 'google', options: { redirectTo } })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <StyledSignInButton
      type="button"
      onClick={signInWithGoogle}
      className="focus-ring"
    >
      {label}
    </StyledSignInButton>
  );
};
