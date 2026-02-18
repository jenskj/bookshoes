import { supabase } from '@lib/supabase';
import type { Database } from '@lib/database.types';
import { useEffect } from 'react';

type UserPresenceInsert = Database['public']['Tables']['user_presence']['Insert'];

export const usePresenceHeartbeat = () => {
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) return;

      const updatePresence = () => {
        const payload: UserPresenceInsert = {
          user_id: user.id,
          last_online_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        void supabase.from('user_presence').upsert(payload);
      };

      updatePresence();
      interval = setInterval(updatePresence, 30000);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);
};
