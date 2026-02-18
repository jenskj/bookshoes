import { supabase } from '@lib/supabase';
import type { Database, Json } from '@lib/database.types';
import type { MeetingInfo, UserRole } from '../types';

type Tables = Database['public']['Tables'];
type CollectionTable = keyof Tables;

type PathResolution = {
  table: CollectionTable;
  clubId?: string;
};

// Parse Firestore-style path to table name and optional club_id
function parseCollectionPath(path: string): PathResolution {
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
function flattenBookPayload(
  body: Record<string, unknown>,
  clubId: string
): Tables['books']['Insert'] {
  const vol = (body.volumeInfo ?? {}) as Record<string, unknown>;
  const imageLinks = vol.imageLinks as { thumbnail?: string } | undefined;

  return {
    club_id: clubId,
    google_id: (body.id ?? body.googleId ?? vol.id ?? null) as string | null,
    title: (vol.title as string | undefined) ?? null,
    authors: (vol.authors as string[] | undefined) ?? [],
    image_thumbnail: imageLinks?.thumbnail ?? null,
    description: (vol.description as string | undefined) ?? null,
    page_count: (vol.pageCount as number | undefined) ?? null,
    average_rating: (vol.averageRating as number | undefined) ?? null,
    ratings_count: (vol.ratingsCount as number | undefined) ?? null,
    published_date: (vol.publishedDate as string | undefined) ?? null,
    publisher: (vol.publisher as string | undefined) ?? null,
    read_status:
      (body.readStatus as Tables['books']['Insert']['read_status']) ??
      'candidate',
    inactive: (body.inactive as boolean | undefined) ?? false,
    scheduled_meetings:
      (body.scheduledMeetings as string[] | undefined) ??
      (body.scheduled_meetings as string[] | undefined) ??
      [],
    ratings: (body.ratings as Json | undefined) ?? [],
    progress_reports:
      (body.progressReports as Json | undefined) ??
      (body.progress_reports as Json | undefined) ??
      [],
  };
}

// Flatten meeting payload for insert/update
function flattenMeetingPayload(
  body: Record<string, unknown>,
  clubId: string
): Tables['meetings']['Insert'] {
  const loc = (body.location ?? {}) as Record<string, unknown>;
  const remote = (loc.remoteInfo ?? {}) as Record<string, unknown>;

  const payload: Tables['meetings']['Insert'] = {
    club_id: clubId,
  };

  if ('date' in body) payload.date = (body.date as string | undefined) ?? null;
  if ('location' in body) {
    payload.location_address = (loc.address as string | undefined) ?? null;
    payload.location_lat = (loc.lat as number | undefined) ?? null;
    payload.location_lng = (loc.lng as number | undefined) ?? null;
    payload.remote_link = (remote.link as string | undefined) ?? null;
    payload.remote_password =
      (remote.password as string | undefined) ?? null;
  }
  if ('comments' in body) payload.comments = (body.comments as Json) ?? [];

  return payload;
}

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
    if (body.volumeInfo !== undefined || body.googleId !== undefined) {
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

export const addNewClubMember = async (
  clubId: string,
  role?: UserRole
): Promise<void> => {
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

  const payload: Tables['club_members']['Insert'] = {
    club_id: clubId,
    user_id: userData.user.id,
    role: role ?? 'standard',
  };

  await supabase.from('club_members').insert(payload);

  const { data: userRow } = await supabase
    .from('users')
    .select('memberships')
    .eq('id', userData.user.id)
    .single();

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
  volumeInfo?: unknown;
  id?: string;
  googleId?: string;
  addedDate?: string;
  readStatus?: string;
  inactive?: boolean;
  scheduledMeetings?: string[];
  ratings?: unknown[];
  progressReports?: unknown[];
}

export const addBook = async (
  clubId: string,
  payload: AddBookPayload
): Promise<{ id: string }> => {
  return addNewDocument(`clubs/${clubId}/books`, payload);
};

export const updateBook = async (
  clubId: string,
  bookId: string,
  payload: Partial<AddBookPayload>
): Promise<void> => {
  return updateDocument(`clubs/${clubId}/books`, payload, bookId);
};

export const deleteBook = async (
  clubId: string,
  bookId: string
): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/books`, bookId);
};

export interface AddMeetingPayload {
  date?: string;
  location?: MeetingInfo['location'];
  comments?: MeetingInfo['comments'];
}

export const addMeeting = async (
  clubId: string,
  payload: AddMeetingPayload
): Promise<{ id: string }> => {
  return addNewDocument(`clubs/${clubId}/meetings`, payload);
};

export const updateMeeting = async (
  clubId: string,
  meetingId: string,
  payload: Partial<AddMeetingPayload> & {
    commentsAppend?: unknown;
    commentsRemove?: unknown;
  }
): Promise<void> => {
  return updateDocument(`clubs/${clubId}/meetings`, payload, meetingId);
};

export const deleteMeeting = async (
  clubId: string,
  meetingId: string
): Promise<void> => {
  return deleteDocument(`clubs/${clubId}/meetings`, meetingId);
};

export const deleteMember = async (
  clubId: string,
  memberId: string
): Promise<void> => {
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
    const { data: book } = await supabase
      .from('books')
      .select('scheduled_meetings')
      .eq('id', bookId)
      .single();
    if (!book) continue;

    const currentMeetings = book.scheduled_meetings ?? [];
    const updatedMeetings = remove
      ? currentMeetings.filter((id) => id !== meetingId)
      : currentMeetings.includes(meetingId)
        ? currentMeetings
        : [...currentMeetings, meetingId];

    await supabase
      .from('books')
      .update({
        scheduled_meetings: updatedMeetings,
        modified_at: new Date().toISOString(),
      })
      .eq('id', bookId);
  }
};
