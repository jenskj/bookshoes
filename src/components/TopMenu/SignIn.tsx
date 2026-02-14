import { supabase } from '@lib/supabase';
import { useCurrentUserStore } from '@hooks';
import { ClubInfo, FirestoreUser, UserInfo } from '@types';
import { useEffect } from 'react';
import { StyledSignInButton } from './styles';

export const SignIn = () => {
  const { setActiveClub, setCurrentUser } = useCurrentUserStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        const { data: existingUser } = await supabase.from('users').select('*').eq('id', uid).single();

        if (!existingUser) {
          const newUserInfo: UserInfo = {
            uid,
            email: session.user.email ?? '',
            displayName: session.user.user_metadata?.full_name ?? session.user.email ?? '',
            photoURL: session.user.user_metadata?.avatar_url ?? '',
          };
          await supabase.from('users').insert({
            id: uid,
            email: session.user.email,
            display_name: newUserInfo.displayName,
            photo_url: newUserInfo.photoURL,
          });
          setCurrentUser({ docId: uid, data: newUserInfo });
        } else {
          const userData = existingUser as Record<string, unknown>;
          const newUser: FirestoreUser = {
            docId: uid,
            data: {
              uid,
              email: (userData.email as string) ?? '',
              displayName: (userData.display_name as string) ?? '',
              photoURL: (userData.photo_url as string) ?? '',
              activeClub: userData.active_club_id as string | undefined,
              memberships: (userData.memberships as string[]) ?? [],
            },
          };
          setCurrentUser(newUser);

          if (newUser.data.activeClub) {
            const { data: club } = await supabase
              .from('clubs')
              .select('*')
              .eq('id', newUser.data.activeClub)
              .single();
            if (club) {
              setActiveClub({
                docId: club.id,
                data: {
                  name: club.name,
                  isPrivate: club.is_private ?? false,
                  tagline: club.tagline,
                  description: club.description,
                },
              });
            }
          }

          if (
            session.user.user_metadata?.avatar_url &&
            session.user.user_metadata.avatar_url !== newUser.data.photoURL
          ) {
            await supabase
              .from('users')
              .update({
                photo_url: session.user.user_metadata.avatar_url,
                modified_at: new Date().toISOString(),
              })
              .eq('id', uid);
          }
        }
      } else {
        setCurrentUser(undefined);
        setActiveClub(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser, setActiveClub]);

  const signInWithGoogle = () => {
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <StyledSignInButton size="small" onClick={signInWithGoogle}>
      Sign in with Google
    </StyledSignInButton>
  );
};
