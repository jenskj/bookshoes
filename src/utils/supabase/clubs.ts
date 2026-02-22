import { supabase } from '@lib/supabase';
import {
  normalizeCreateClubAccessMode,
  sanitizeClubSettings,
} from '@lib/clubSettings';
import { mapClubInviteRow } from '@lib/mappers';
import type {
  ClubInfo,
  ClubInvite,
  ClubJoinRequestDecision,
  ClubSettings,
  UserRole,
} from '@types';
import { deleteDocument } from './legacy';

export const addNewClubMember = async (
  clubId: string,
  role?: UserRole
): Promise<void> => {
  if (role && role !== 'standard') {
    throw new Error('Manual role assignment is not supported in this flow.');
  }

  const { data, error } = await supabase.rpc('join_public_club', {
    p_club_id: clubId,
  });
  if (error) throw error;
  if (!data) {
    throw new Error('Club join failed.');
  }
};

export interface CreateClubPayload {
  name: string;
  isPrivate?: boolean;
  tagline?: string;
  description?: string;
  settings?: ClubSettings;
}

type RpcErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null;

export const isLegacyCreateClubSignatureError = (error: RpcErrorLike): boolean => {
  if (!error) return false;
  if (error.code === 'PGRST202') return true;

  const combined = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  return (
    /create_club_with_admin/i.test(combined)
    && /p_settings/i.test(combined)
  );
};

export const createClubWithAdmin = async (
  payload: CreateClubPayload
): Promise<{ id: string }> => {
  const rpcPayload = {
    p_name: payload.name,
    p_is_private: payload.isPrivate ?? false,
    p_tagline: payload.tagline ?? null,
    p_description: payload.description ?? null,
    p_settings: sanitizeClubSettings(payload.settings ?? {}),
  };

  const firstAttempt = await supabase.rpc('create_club_with_admin', rpcPayload);
  if (!firstAttempt.error && firstAttempt.data) {
    return { id: firstAttempt.data };
  }

  if (!isLegacyCreateClubSignatureError(firstAttempt.error)) {
    throw firstAttempt.error ?? new Error('Club creation failed.');
  }

  const legacyAttempt = await supabase.rpc('create_club_with_admin', {
    p_name: payload.name,
    p_is_private: payload.isPrivate ?? false,
    p_tagline: payload.tagline ?? null,
    p_description: payload.description ?? null,
  });
  if (legacyAttempt.error) throw legacyAttempt.error;
  if (!legacyAttempt.data) {
    throw new Error('Club creation failed.');
  }

  return { id: legacyAttempt.data };
};

export const updateClubProfile = async (
  clubId: string,
  payload: Partial<Pick<ClubInfo, 'name' | 'isPrivate' | 'tagline' | 'description'>>
): Promise<void> => {
  const updatePayload = {
    modified_at: new Date().toISOString(),
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.isPrivate !== undefined ? { is_private: payload.isPrivate } : {}),
    ...(payload.tagline !== undefined ? { tagline: payload.tagline ?? null } : {}),
    ...(payload.description !== undefined
      ? { description: payload.description ?? null }
      : {}),
  };

  const { error } = await supabase
    .from('clubs')
    .update(updatePayload)
    .eq('id', clubId);
  if (error) throw error;
};

export const updateClubSettings = async (
  clubId: string,
  settings: ClubSettings,
  isPrivate?: boolean
): Promise<void> => {
  const sanitized = sanitizeClubSettings(settings);
  const normalizedSettings =
    isPrivate === undefined
      ? sanitized
      : {
          ...sanitized,
          access: {
            ...sanitized.access,
            joinMode: normalizeCreateClubAccessMode(
              isPrivate,
              sanitized.access.joinMode
            ),
          },
        };

  const { error } = await supabase
    .from('clubs')
    .update({
      settings: normalizedSettings,
      modified_at: new Date().toISOString(),
    })
    .eq('id', clubId);
  if (error) throw error;
};

export interface CreateClubInvitePayload {
  expiresAt?: string | null;
  maxUses?: number | null;
}

export const createClubInvite = async (
  clubId: string,
  payload: CreateClubInvitePayload = {}
): Promise<ClubInvite> => {
  const { data, error } = await supabase.rpc('create_club_invite', {
    p_club_id: clubId,
    p_expires_at: payload.expiresAt ?? null,
    p_max_uses: payload.maxUses ?? null,
  });
  if (error) throw error;
  if (!data) {
    throw new Error('Invite creation failed.');
  }
  return mapClubInviteRow(data as Record<string, unknown>);
};

export const revokeClubInvite = async (
  clubId: string,
  inviteId: string
): Promise<void> => {
  if (!clubId) {
    throw new Error('Club id is required.');
  }
  const { error } = await supabase.rpc('revoke_club_invite', {
    p_invite_id: inviteId,
  });
  if (error) throw error;
};

export const acceptClubInvite = async (inviteCode: string): Promise<string> => {
  const { data, error } = await supabase.rpc('accept_club_invite', {
    p_invite_code: inviteCode.trim().toUpperCase(),
  });
  if (error) throw error;
  if (!data) {
    throw new Error('Invite accept failed.');
  }
  return data;
};

export const requestClubJoin = async (
  clubId: string,
  message?: string
): Promise<{ id: string }> => {
  const { data, error } = await supabase.rpc('request_club_membership', {
    p_club_id: clubId,
    p_message: message?.trim() ? message.trim() : null,
  });
  if (error) throw error;
  if (!data) {
    throw new Error('Membership request failed.');
  }
  return { id: data };
};

export const reviewClubJoinRequest = async (
  requestId: string,
  decision: ClubJoinRequestDecision
): Promise<void> => {
  const { error } = await supabase.rpc('review_club_join_request', {
    p_request_id: requestId,
    p_decision: decision,
  });
  if (error) throw error;
};

export const updateClubMemberRole = async (
  clubId: string,
  memberId: string,
  role: UserRole
): Promise<void> => {
  if (!clubId) {
    throw new Error('Club id is required.');
  }
  const { error } = await supabase.rpc('update_club_member_role', {
    p_member_id: memberId,
    p_new_role: role,
  });
  if (error) throw error;
};

export const removeClubMember = async (
  clubId: string,
  memberId: string
): Promise<void> => {
  if (!clubId) {
    throw new Error('Club id is required.');
  }
  const { error } = await supabase.rpc('remove_club_member', {
    p_member_id: memberId,
  });
  if (error) throw error;
};

export const leaveClub = async (clubId: string): Promise<void> => {
  const { error } = await supabase.rpc('leave_club', {
    p_club_id: clubId,
  });
  if (error) throw error;
};

export const deleteMember = async (
  clubId: string,
  memberId: string
): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/members`, memberId);
};
