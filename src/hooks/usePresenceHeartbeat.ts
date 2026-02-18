import { supabase } from '@lib/supabase';
import { useEffect } from 'react';

export const usePresenceHeartbeat = () => {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) return;

      const updatePresence = () => {
        supabase.from('user_presence').upsert({
          user_id: user.id,
          last_online_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      };

      updatePresence();
      interval = setInterval(updatePresence, 30000);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
};
