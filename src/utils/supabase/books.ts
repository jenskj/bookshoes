import { supabase } from '@lib/supabase';
import type { Json } from '@lib/database.types';
import type { BookSource } from '@types';
import { addNewDocument, deleteDocument, updateDocument } from './legacy';

export interface AddBookPayload {
  volumeInfo?: unknown;
  id?: string;
  googleId?: string;
  source?: BookSource;
  sourceBookId?: string | null;
  source_book_id?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  isbn10?: string | null;
  isbn_10?: string | null;
  isbn13?: string | null;
  isbn_13?: string | null;
  metadataRaw?: unknown;
  metadata_raw?: unknown;
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

export const updateBookScheduledMeetings = async (
  bookIds: string[],
  _activeClubId: string,
  meetingId: string,
  _timestamp?: unknown,
  remove = false
): Promise<void> => {
  const results = await Promise.allSettled(
    bookIds
      .filter(Boolean)
      .map(async (bookId) => {
        const { data: book } = await supabase
          .from('books')
          .select('scheduled_meetings')
          .eq('id', bookId)
          .single();
        if (!book) return;

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
      })
  );

  const failedCount = results.filter((result) => result.status === 'rejected').length;
  if (failedCount > 0) {
    throw new Error(`Failed to update ${failedCount} book meeting links.`);
  }
};

export const removeUserProgressReportsFromMembershipClubs = async (
  userId: string,
  clubIds: string[]
): Promise<void> => {
  if (!clubIds.length) return;

  for (const clubId of clubIds) {
    const { data: clubBooks } = await supabase
      .from('books')
      .select('id, progress_reports')
      .eq('club_id', clubId);

    for (const book of clubBooks ?? []) {
      const progressReports = Array.isArray(book.progress_reports)
        ? (book.progress_reports as Array<Record<string, unknown>>)
        : [];
      const filteredReports = progressReports.filter((report) => {
        const reportUser = report.user as Record<string, unknown> | undefined;
        return reportUser?.uid !== userId;
      });
      if (filteredReports.length === progressReports.length) continue;

      await supabase
        .from('books')
        .update({
          progress_reports: filteredReports as Json,
          modified_at: new Date().toISOString(),
        })
        .eq('id', book.id);
    }
  }
};
