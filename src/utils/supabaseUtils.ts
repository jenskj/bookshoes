import { supabase } from '@lib/supabase';
import type { UserRole } from '../types';

// Parse Firestore-style path to table name and optional club_id
function parseCollectionPath(path: string): { table: string; clubId?: string } {
  if (path === 'clubs') return { table: 'clubs' };
  if (path === 'users') return { table: 'users' };
  const parts = path.split('/');
  if (parts[0] === 'clubs' && parts.length >= 2) {
    const clubId = parts[1];
    const sub = parts[2]; // 'books' | 'meetings' | 'members'
    if (sub === 'books') return { table: 'books', clubId };
    if (sub === 'meetings') return { table: 'meetings', clubId };
    if (sub === 'members') return { table: 'club_members', clubId };
  }
  throw new Error(`Unknown collection path: ${path}`);
}

// Flatten book payload for insert/update
function flattenBookPayload(body: Record<string, unknown>, clubId: string): Record<string, unknown> {
  const vol = (body.volumeInfo ?? {}) as Record<string, unknown>;
  return {
    club_id: clubId,
    google_id: body.id ?? body.googleId ?? vol.id,
    title: vol.title ?? '',
    authors: (vol.authors as string[]) ?? [],
    image_thumbnail: (vol.imageLinks as { thumbnail?: string })?.thumbnail,
    description: vol.description,
    page_count: vol.pageCount ?? 0,
    average_rating: vol.averageRating,
    ratings_count: vol.ratingsCount,
    published_date: vol.publishedDate,
    publisher: vol.publisher,
    read_status: body.readStatus ?? 'candidate',
    inactive: body.inactive ?? false,
    scheduled_meetings: body.scheduledMeetings ?? body.scheduled_meetings ?? [],
    ratings: body.ratings ?? [],
    progress_reports: body.progressReports ?? body.progress_reports ?? [],
  };
}

// Flatten meeting payload for insert/update
function flattenMeetingPayload(body: Record<string, unknown>, clubId: string): Record<string, unknown> {
  const loc = (body.location ?? {}) as Record<string, unknown>;
  const remote = (loc.remoteInfo ?? {}) as Record<string, unknown>;
  const payload: Record<string, unknown> = {
    club_id: clubId,
    date: body.date,
    location_address: loc.address,
    location_lat: loc.lat,
    location_lng: loc.lng,
    remote_link: remote.link,
    remote_password: remote.password,
  };
  if (body.comments !== undefined) payload.comments = body.comments;
  return payload;
}

export const addNewDocument = async (
  collectionName: string,
  body: Record<string, unknown>
): Promise<{ id: string }> => {
  const { table, clubId } = parseCollectionPath(collectionName);

  if (table === 'clubs') {
    const { data, error } = await supabase
      .from('clubs')
      .insert({
        name: body.name,
        is_private: body.isPrivate ?? false,
        tagline: body.tagline,
        description: body.description,
      })
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'club_members' && clubId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error('Not authenticated');
    const user = userData.user;
    const { data: userRow } = await supabase.from('users').select('*').eq('id', user.id).single();
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: (body.role as string) ?? 'standard',
      })
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'books' && clubId) {
    const payload = flattenBookPayload(body, clubId);
    if (body.addedDate) {
      (payload as Record<string, unknown>).added_at = body.addedDate;
    }
    const { data, error } = await supabase.from('books').insert(payload).select('id').single();
    if (error) throw error;
    return { id: data.id };
  }

  if (table === 'meetings' && clubId) {
    const payload = flattenMeetingPayload(body, clubId);
    const { data, error } = await supabase.from('meetings').insert(payload).select('id').single();
    if (error) throw error;
    return { id: data.id };
  }

  throw new Error(`addNewDocument not implemented for ${collectionName}`);
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
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
  const base: Record<string, unknown> = { modified_at: new Date().toISOString() };

  if (table === 'users') {
    const updateBody: Record<string, unknown> = { ...base };
    if (body.active_club_id !== undefined) updateBody.active_club_id = body.active_club_id;
    if (body.activeClub !== undefined) updateBody.active_club_id = body.activeClub;
    if (body.memberships !== undefined) updateBody.memberships = body.memberships;
    if (body.membershipsRemove !== undefined) {
      const { data: userRow } = await supabase.from('users').select('memberships').eq('id', docId).single();
      const current = (userRow?.memberships ?? []) as string[];
      const toRemove = body.membershipsRemove as string;
      updateBody.memberships = current.filter((cid) => cid !== toRemove);
    }
    if (body.photoURL !== undefined) updateBody.photo_url = body.photoURL;
    const { error } = await supabase.from('users').update(updateBody).eq('id', docId);
    if (error) throw error;
    return;
  }

  if (table === 'books' && clubId) {
    const payload: Record<string, unknown> = { ...base };
    if (body.scheduledMeetings !== undefined) payload.scheduled_meetings = body.scheduledMeetings;
    if (body.readStatus !== undefined) payload.read_status = body.readStatus;
    if (body.inactive !== undefined) payload.inactive = body.inactive;
    if (body.ratings !== undefined) payload.ratings = body.ratings;
    if (body.progressReports !== undefined) payload.progress_reports = body.progressReports;
    if (body.volumeInfo !== undefined || body.googleId !== undefined) {
      const flat = flattenBookPayload(body, clubId);
      delete flat.club_id;
      Object.assign(payload, flat);
    }
    const { error } = await supabase.from('books').update(payload).eq('id', docId);
    if (error) throw error;
    return;
  }

  if (table === 'meetings' && clubId) {
    const payload: Record<string, unknown> = { ...base };
    if (body.comments !== undefined) {
      payload.comments = body.comments;
    } else if (body.commentsAppend !== undefined) {
      const { data: meeting } = await supabase.from('meetings').select('comments').eq('id', docId).single();
      const current = (meeting?.comments ?? []) as unknown[];
      payload.comments = [...current, body.commentsAppend];
    } else if (body.commentsRemove !== undefined) {
      const { data: meeting } = await supabase.from('meetings').select('comments').eq('id', docId).single();
      const current = (meeting?.comments ?? []) as unknown[];
      const toRemove = body.commentsRemove as unknown;
      payload.comments = current.filter((c) => JSON.stringify(c) !== JSON.stringify(toRemove));
    } else {
      Object.assign(payload, flattenMeetingPayload(body, clubId));
      delete payload.club_id;
    }
    const { error } = await supabase.from('meetings').update(payload).eq('id', docId);
    if (error) throw error;
    return;
  }

  throw new Error(`updateDocument not implemented for ${collectionName}`);
};

export const addNewClubMember = async (clubId: string, role?: UserRole): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) return;

  const { data: existing } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (existing) {
    throw new Error('Already a member');
  }

  await supabase.from('club_members').insert({
      club_id: clubId,
      user_id: userData.user.id,
      role: role ?? 'standard',
    });

    const { data: userRow } = await supabase.from('users').select('memberships').eq('id', userData.user.id).single();
    const memberships = new Set<string>(userRow?.memberships ?? []);
    memberships.add(clubId);

    await supabase
      .from('users')
      .update({
        memberships: Array.from(memberships),
        active_club_id: clubId,
        modified_at: new Date().toISOString(),
      })
      .eq('id', userData.user.id);
};

// Typed table-based API (preferred over path-based updateDocument/addNewDocument)

export interface AddBookPayload {
  volumeInfo?: Record<string, unknown>;
  id?: string;
  googleId?: string;
  addedDate?: string;
  readStatus?: string;
  inactive?: boolean;
  scheduledMeetings?: string[];
  ratings?: unknown[];
  progressReports?: unknown[];
}

export const addBook = async (clubId: string, payload: AddBookPayload): Promise<{ id: string }> => {
  return addNewDocument(`clubs/${clubId}/books`, payload);
};

export const updateBook = async (
  clubId: string,
  bookId: string,
  payload: Partial<AddBookPayload>
): Promise<void> => {
  return updateDocument(`clubs/${clubId}/books`, payload, bookId);
};

export const deleteBook = async (clubId: string, bookId: string): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/books`, bookId);
};

export interface AddMeetingPayload {
  date?: string;
  location?: Record<string, unknown>;
  comments?: unknown[];
}

export const addMeeting = async (clubId: string, payload: AddMeetingPayload): Promise<{ id: string }> => {
  return addNewDocument(`clubs/${clubId}/meetings`, payload);
};

export const updateMeeting = async (
  clubId: string,
  meetingId: string,
  payload: Partial<AddMeetingPayload> & { commentsAppend?: unknown; commentsRemove?: unknown }
): Promise<void> => {
  return updateDocument(`clubs/${clubId}/meetings`, payload, meetingId);
};

export const deleteMeeting = async (clubId: string, meetingId: string): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/meetings`, meetingId);
};

export const deleteMember = async (clubId: string, memberId: string): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/members`, memberId);
};

export const updateBookScheduledMeetings = async (
  bookIds: string[],
  _activeClubId: string,
  meetingId: string,
  _timestamp?: unknown,
  remove = false
): Promise<void> => {
  for (const bookId of bookIds) {
    if (!bookId) continue;
    const { data: book } = await supabase.from('books').select('scheduled_meetings').eq('id', bookId).single();
    if (!book) continue;

    const current = (book.scheduled_meetings ?? []) as string[];
    const updated = remove
      ? current.filter((id) => id !== meetingId)
      : current.includes(meetingId)
        ? current
        : [...current, meetingId];

    await supabase
      .from('books')
      .update({
        scheduled_meetings: updated,
        modified_at: new Date().toISOString(),
      })
      .eq('id', bookId);
  }
};

