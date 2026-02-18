import type {
  Book,
  BookInfo,
  Club,
  ClubInfo,
  Meeting,
  MeetingInfo,
  Member,
  MemberInfo,
} from '@types';

/** Map DB book row (snake_case) to Book (camelCase) */
export function mapBookRow(row: Record<string, unknown>): Book {
  const source = row.source as BookInfo['source'];
  const sourceBookId = (row.source_book_id as string | null) ?? (row.google_id as string | null);
  const resolvedId = sourceBookId ?? (row.id as string);
  const coverUrl = (row.cover_url as string | null) ?? (row.image_thumbnail as string | null);

  return {
    docId: row.id as string,
    data: {
      id: resolvedId,
      volumeInfo: {
        title: (row.title as string) ?? '',
        authors: (row.authors as string[]) ?? [],
        imageLinks: coverUrl ? { thumbnail: coverUrl } : undefined,
        description: (row.description as string | null) ?? undefined,
        pageCount: (row.page_count as number) ?? 0,
        averageRating: (row.average_rating as number | null) ?? undefined,
        ratingsCount: (row.ratings_count as number | null) ?? undefined,
        publishedDate: (row.published_date as string | null) ?? undefined,
        publisher: (row.publisher as string | null) ?? undefined,
      },
      source,
      sourceBookId,
      coverUrl: coverUrl ?? undefined,
      isbn10: (row.isbn_10 as string | null) ?? undefined,
      isbn13: (row.isbn_13 as string | null) ?? undefined,
      metadataRaw: (row.metadata_raw as Record<string, unknown>) ?? {},
      readStatus: row.read_status as BookInfo['readStatus'],
      addedDate: row.added_at as string,
      inactive: row.inactive as boolean,
      googleId: row.google_id as string,
      scheduledMeetings: (row.scheduled_meetings as string[]) ?? [],
      ratings: (row.ratings as BookInfo['ratings']) ?? [],
      progressReports: (row.progress_reports as BookInfo['progressReports']) ?? [],
    } as BookInfo,
  };
}

/** Map DB meeting row (snake_case) to Meeting (camelCase) */
export function mapMeetingRow(row: Record<string, unknown>): Meeting {
  return {
    docId: row.id as string,
    data: {
      date: row.date as string,
      location: {
        address: row.location_address,
        lat: row.location_lat,
        lng: row.location_lng,
        remoteInfo: {
          link: row.remote_link,
          password: row.remote_password,
        },
      },
      comments: (row.comments as MeetingInfo['comments']) ?? [],
    } as MeetingInfo,
  };
}

/** Map DB club_members row (and optional user) to Member */
export function mapMemberRow(row: Record<string, unknown>, user?: Record<string, unknown>): Member {
  const u = user ?? row;
  return {
    docId: row.id as string,
    data: {
      uid: u.user_id as string,
      displayName: (u.display_name as string) ?? '',
      photoURL: (u.photo_url as string) ?? '',
      role: (row.role as MemberInfo['role']) ?? 'standard',
    } as MemberInfo,
  };
}

/** Map DB club row to Club */
export function mapClubRow(row: Record<string, unknown>): Club {
  return {
    docId: row.id as string,
    data: {
      name: row.name as string,
      isPrivate: (row.is_private as boolean) ?? false,
      tagline: row.tagline as string | undefined,
      description: row.description as string | undefined,
    } as ClubInfo,
  };
}
