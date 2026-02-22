import type { Database, Json } from '@lib/database.types';
import type { BookSource } from '@types';

export type Tables = Database['public']['Tables'];
export type CollectionTable = keyof Tables;

export type PathResolution = {
  table: CollectionTable;
  clubId?: string;
};

// Parse Firestore-style path to table name and optional club_id
export function parseCollectionPath(path: string): PathResolution {
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

function getIndustryIdentifier(
  identifiers: unknown,
  type: 'ISBN_10' | 'ISBN_13'
): string | null {
  if (!Array.isArray(identifiers)) return null;
  const match = identifiers.find((item) => {
    if (!item || typeof item !== 'object') return false;
    const value = item as Record<string, unknown>;
    return value.type === type && typeof value.identifier === 'string';
  }) as Record<string, unknown> | undefined;
  return (match?.identifier as string | undefined) ?? null;
}

// Flatten book payload for insert/update
export function flattenBookPayload(
  body: Record<string, unknown>,
  clubId: string
): Tables['books']['Insert'] {
  const vol = (body.volumeInfo ?? {}) as Record<string, unknown>;
  const imageLinks = vol.imageLinks as { thumbnail?: string } | undefined;
  const sourceBookId = (body.sourceBookId ??
    body.source_book_id ??
    body.id ??
    body.googleId ??
    vol.id ??
    null) as string | null;
  const source = ((body.source as BookSource | undefined) ??
    (sourceBookId ? 'google' : 'manual')) as Tables['books']['Insert']['source'];
  const coverUrl = (body.coverUrl ??
    body.cover_url ??
    imageLinks?.thumbnail ??
    null) as string | null;
  const isbn13 = (body.isbn13 ??
    body.isbn_13 ??
    getIndustryIdentifier(vol.industryIdentifiers, 'ISBN_13') ??
    null) as string | null;
  const isbn10 = (body.isbn10 ??
    body.isbn_10 ??
    getIndustryIdentifier(vol.industryIdentifiers, 'ISBN_10') ??
    null) as string | null;
  const metadataRaw = (body.metadataRaw ??
    body.metadata_raw ??
    body.providerMetadata ??
    {}) as Json;
  const googleId =
    source === 'google'
      ? (body.googleId ?? body.id ?? sourceBookId ?? null)
      : (body.googleId ?? null);

  return {
    club_id: clubId,
    google_id: googleId as string | null,
    source,
    source_book_id: source === 'manual' ? null : sourceBookId,
    title: (vol.title as string | undefined) ?? null,
    authors: (vol.authors as string[] | undefined) ?? [],
    image_thumbnail: imageLinks?.thumbnail ?? null,
    cover_url: coverUrl,
    isbn_10: isbn10,
    isbn_13: isbn13,
    metadata_raw: metadataRaw,
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
export function flattenMeetingPayload(
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
