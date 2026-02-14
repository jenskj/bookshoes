import {
    StyledMeetingLink,
    StyledMeetingLinkDate,
    StyledMeetingLinkLocation,
    StyledScheduledMeetings,
} from '@components/Book/styles';
import { CalendarMonthRounded, PlaceRounded } from '@mui/icons-material';
import { formatDate } from '@utils';

interface BookScheduledMeetingProps {
  sortedMeetings: {
    upcoming: Array<any>;
    past: Array<any>;
  };
  book: any;
}

export const BookScheduledMeeting = ({
  sortedMeetings,
  book,
}: BookScheduledMeetingProps) => {
  return sortedMeetings.upcoming ? (
    <StyledScheduledMeetings>
      {sortedMeetings.upcoming
        .filter((meeting) =>
          book.data.scheduledMeetings?.includes(meeting.docId)
        )
        .map((meeting) => (
          <StyledMeetingLink key={meeting.docId} to={`/meetings/${meeting.docId}`}>
            <StyledMeetingLinkDate>
              <CalendarMonthRounded />
              {`${
                meeting.data.date
                  ? `Meeting scheduled on ${formatDate(meeting.data.date)}`
                  : 'with no date'
              }`}
            </StyledMeetingLinkDate>
            <StyledMeetingLinkLocation>
              <>
                <PlaceRounded />
                {`${
                  meeting.data.location?.remoteInfo
                    ? 'Held remotely'
                    : meeting.data.location?.user?.displayName
                    ? meeting.data.location.user.displayName
                    : 'unknown location'
                }`}
              </>
            </StyledMeetingLinkLocation>
          </StyledMeetingLink>
        ))}
    </StyledScheduledMeetings>
  ) : null;
};
