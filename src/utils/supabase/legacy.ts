import { supabase } from '@lib/supabase';
import type { Json } from '@lib/database.types';
import type { UserRole } from '@types';
import {
  flattenBookPayload,
  flattenMeetingPayload,
  parseCollectionPath,
  type Tables,
} from './shared';

export const addNewDocument = async <T extends object>(
  collectionName: string,
  body: T
): Promise<{ id: string }> => {
  const { table, clubId } = parseCollectionPath(collectionName);
  const bodyRecord = body as Record<string, unknown>;

  if (table === 'clubs') {
    const payload: Tables['clubs']['Insert'] = {
      name: String(bodyRecord.name ?? ''),
      is_private: (bodyRecord.isPrivate as boolean | undefined) ?? false,
      tagline: (bodyRecord.tagline as string | undefined) ?? null,
      description: (bodyRecord.description as string | undefined) ?? null,
    };
    const { data, error } = await supabase
      .from('clubs')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'club_members' && clubId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error('Not authenticated');

    const payload: Tables['club_members']['Insert'] = {
      club_id: clubId,
      user_id: userData.user.id,
      role: (bodyRecord.role as UserRole | undefined) ?? 'standard',
    };

    const { data, error } = await supabase
      .from('club_members')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'books' && clubId) {
    const payload = flattenBookPayload(bodyRecord, clubId);
    if (bodyRecord.addedDate) {
      payload.added_at = bodyRecord.addedDate as string;
    }
    const { data, error } = await supabase
      .from('books')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'meetings' && clubId) {
    const payload = flattenMeetingPayload(bodyRecord, clubId);
    const { data, error } = await supabase
      .from('meetings')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  throw new Error(`addNewDocument not implemented for ${collectionName}`);
};

export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const { table } = parseCollectionPath(collectionName);
  const { error } = await supabase.from(table).delete().eq('id', docId);
  if (error) throw error;
};

export const updateDocument = async (
  collectionName: string,
  body: Record<string, unknown>,
  docId: string
): Promise<void> => {
  const { table, clubId } = parseCollectionPath(collectionName);
  const modifiedAt = new Date().toISOString();

  if (table === 'users') {
    const updateBody: Tables['users']['Update'] = { modified_at: modifiedAt };
    if (body.display_name !== undefined) {
      updateBody.display_name = body.display_name as string | null;
    }
    if (body.displayName !== undefined) {
      updateBody.display_name = body.displayName as string | null;
    }
    if (body.active_club_id !== undefined) {
      updateBody.active_club_id = body.active_club_id as string | null;
    }
    if (body.activeClub !== undefined) {
      updateBody.active_club_id = body.activeClub as string | null;
    }
    if (body.memberships !== undefined) {
      updateBody.memberships = body.memberships as string[];
    }
    if (body.membershipsRemove !== undefined) {
      const { data: userRow } = await supabase
        .from('users')
        .select('memberships')
        .eq('id', docId)
        .single();
      const currentMemberships = userRow?.memberships ?? [];
      const toRemove = body.membershipsRemove as string;
      updateBody.memberships = currentMemberships.filter(
        (clubMembershipId) => clubMembershipId !== toRemove
      );
    }
    if (body.photoURL !== undefined) {
      updateBody.photo_url = body.photoURL as string;
    }
    if (body.preferences !== undefined) {
      updateBody.preferences = body.preferences as Json;
    }
    const { error } = await supabase
      .from('users')
      .update(updateBody)
      .eq('id', docId);
    if (error) throw error;
    return;
  }

  if (table === 'books' && clubId) {
    const payload: Tables['books']['Update'] = { modified_at: modifiedAt };
    if (body.scheduledMeetings !== undefined) {
      payload.scheduled_meetings = body.scheduledMeetings as string[];
    }
    if (body.readStatus !== undefined) {
      payload.read_status = body.readStatus as Tables['books']['Update']['read_status'];
    }
    if (body.inactive !== undefined) {
      payload.inactive = body.inactive as boolean;
    }
    if (body.ratings !== undefined) {
      payload.ratings = body.ratings as Json;
    }
    if (body.progressReports !== undefined) {
      payload.progress_reports = body.progressReports as Json;
    }
    if (body.source !== undefined) {
      payload.source = body.source as Tables['books']['Update']['source'];
    }
    if (body.sourceBookId !== undefined || body.source_book_id !== undefined) {
      payload.source_book_id = (body.sourceBookId ?? body.source_book_id) as
        | string
        | null;
    }
    if (body.coverUrl !== undefined || body.cover_url !== undefined) {
      payload.cover_url = (body.coverUrl ?? body.cover_url) as string | null;
    }
    if (body.isbn10 !== undefined || body.isbn_10 !== undefined) {
      payload.isbn_10 = (body.isbn10 ?? body.isbn_10) as string | null;
    }
    if (body.isbn13 !== undefined || body.isbn_13 !== undefined) {
      payload.isbn_13 = (body.isbn13 ?? body.isbn_13) as string | null;
    }
    if (body.metadataRaw !== undefined || body.metadata_raw !== undefined) {
      payload.metadata_raw = (body.metadataRaw ?? body.metadata_raw) as Json;
    }
    if (
      body.volumeInfo !== undefined ||
      body.googleId !== undefined ||
      body.id !== undefined ||
      body.source !== undefined
    ) {
      const flat = flattenBookPayload(body, clubId);
      const { club_id: _, ...rest } = flat;
      Object.assign(payload, rest);
    }
    const { error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', docId);
    if (error) throw error;
    return;
  }

  if (table === 'meetings' && clubId) {
    const payload: Tables['meetings']['Update'] = { modified_at: modifiedAt };
    if (body.comments !== undefined) {
      payload.comments = body.comments as Json;
    } else if (body.commentsAppend !== undefined) {
      const { data: meeting } = await supabase
        .from('meetings')
        .select('comments')
        .eq('id', docId)
        .single();
      const currentComments = Array.isArray(meeting?.comments)
        ? meeting.comments
        : [];
      payload.comments = [...currentComments, body.commentsAppend] as Json;
    } else if (body.commentsRemove !== undefined) {
      const { data: meeting } = await supabase
        .from('meetings')
        .select('comments')
        .eq('id', docId)
        .single();
      const currentComments = Array.isArray(meeting?.comments)
        ? meeting.comments
        : [];
      const toRemove = body.commentsRemove;
      payload.comments = currentComments.filter(
        (comment) => JSON.stringify(comment) !== JSON.stringify(toRemove)
      ) as Json;
    } else {
      const flat = flattenMeetingPayload(body, clubId);
      const { club_id: _, ...rest } = flat;
      Object.assign(payload, rest);
    }

    const { error } = await supabase
      .from('meetings')
      .update(payload)
      .eq('id', docId);
    if (error) throw error;
    return;
  }

  throw new Error(`updateDocument not implemented for ${collectionName}`);
};
