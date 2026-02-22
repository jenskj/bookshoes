import type { MeetingInfo } from '@types';
import { addNewDocument, deleteDocument, updateDocument } from './legacy';

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
