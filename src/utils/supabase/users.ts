import { supabase } from '@lib/supabase';
import type { Json } from '@lib/database.types';
import type { UserSettings } from '@types';
import { updateDocument } from './legacy';

export const updateUserProfile = async (
  userId: string,
  payload: {
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> => {
  return updateDocument('users', payload, userId);
};

export const updateUserSettings = async (
  userId: string,
  settings: UserSettings
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({
      preferences: settings as unknown as Json,
      modified_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};
