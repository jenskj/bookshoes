import { BookCover, MemberList } from '@components';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import { MeetingComment } from '@types';
import { formatDate, parseDate } from '@utils';
import {
  StyledDashboardGrid,
  StyledDataGrid,
  StyledMetaLabel,
  StyledMilestoneRow,
  StyledNoteCard,
  StyledNotesList,
  StyledPaceBar,
  StyledPaceFill,
  StyledPaceLabel,
  StyledPaceNumbers,
  StyledPrimaryAction,
  StyledSectionCard,
  StyledSectionHeader,
  StyledValue,
} from './styles';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toIso = (value: string | undefined) => {
  if (!value) return '';
  const parsed = parseDate(value);
  return parsed ? parsed.toISOString() : '';
};

const getMeetingNotes = (
  comments: MeetingComment[] | undefined,
  meetingId: string
) => {
  return (comments ?? []).map((comment) => ({
    ...comment,
    meetingId,
  }));
};

export const ClubHome = () => {
  const books = useBookStore((state) => state.books);
  const meetings = useMeetingStore((state) => state.meetings);
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const members = useCurrentUserStore((state) => state.members);
  const settings = useCurrentUserStore((state) => state.settings);

  const currentRead =
    books.find((book) => book.data.readStatus === 'reading' && !book.data.inactive) ||
    books.find((book) => book.data.readStatus === 'candidate' && !book.data.inactive) ||
    books.find((book) => !book.data.inactive);

  const activeNotes = meetings
    .flatMap((meeting) => getMeetingNotes(meeting.data.comments, meeting.docId))
    .sort((a, b) => {
      const aDate = toIso(a.dateModified || a.dateAdded);
      const bDate = toIso(b.dateModified || b.dateAdded);
      return aDate < bDate ? 1 : -1;
    })
    .slice(0, 4);

  const nextMeeting = meetings
    .filter((meeting) => {
      const date = parseDate(meeting.data.date);
      return date ? date > new Date() : false;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.data.date)?.getTime() ?? 0;
      const dateB = parseDate(b.data.date)?.getTime() ?? 0;
      return dateA - dateB;
    })[0];

  const totalPages = currentRead?.data.volumeInfo?.pageCount || 0;
  const progressReports = currentRead?.data.progressReports || [];
  const groupAverage = progressReports.length
    ? Math.round(
        progressReports.reduce((sum, report) => sum + report.currentPage, 0) /
          progressReports.length
      )
    : 0;
  const userProgress =
    progressReports.find((report) => report.user.uid === currentUser?.docId)
      ?.currentPage || 0;
  const groupPct = totalPages ? clamp((groupAverage / totalPages) * 100, 0, 100) : 0;
  const userPct = totalPages ? clamp((userProgress / totalPages) * 100, 0, 100) : 0;
  const paceDelta = userProgress - groupAverage;
  const paceLabel =
    paceDelta > 8 ? 'Ahead' : paceDelta < -8 ? 'Behind' : 'On Pace';

  const targetPage = totalPages
    ? Math.min(totalPages, groupAverage + Math.max(15, Math.round(totalPages * 0.08)))
    : 0;
  const targetChapter = targetPage ? Math.max(1, Math.ceil(targetPage / 30)) : null;

  return (
    <StyledDashboardGrid className="fade-up">
      <StyledSectionCard className="surface hover-lift">
        <StyledSectionHeader>
          <h2>Current Read</h2>
          <StyledPrimaryAction to="/books" className="focus-ring">
            Open Books
          </StyledPrimaryAction>
        </StyledSectionHeader>
        {currentRead ? (
          <StyledDataGrid>
            <div>
              <BookCover bookInfo={currentRead.data} size="L" />
            </div>
            <div>
              <StyledValue>{currentRead.data.volumeInfo?.title}</StyledValue>
              <StyledMetaLabel>
                {currentRead.data.volumeInfo?.authors?.join(', ') || 'Unknown author'}
              </StyledMetaLabel>
              <StyledPaceNumbers>
                <span className="mono">Group Avg: p.{groupAverage || '--'}</span>
                <span className="mono">You: p.{userProgress || '--'}</span>
              </StyledPaceNumbers>
              <StyledPaceBar>
                <StyledPaceFill percentage={groupPct} tone="group" />
                <StyledPaceFill percentage={userPct} tone="user" />
              </StyledPaceBar>
              <StyledPaceLabel data-tone={paceLabel.toLowerCase()}>
                {paceLabel} ({paceDelta >= 0 ? '+' : ''}
                {paceDelta} pages)
              </StyledPaceLabel>
            </div>
          </StyledDataGrid>
        ) : (
          <p>No active reads yet. Promote a title in Library voting to begin.</p>
        )}
      </StyledSectionCard>

      <StyledSectionCard className="surface hover-lift">
        <StyledSectionHeader>
          <h2>Milestones</h2>
          <StyledPrimaryAction to="/meetings" className="focus-ring">
            Manage Meetings
          </StyledPrimaryAction>
        </StyledSectionHeader>
        <StyledMilestoneRow>
          <span className="mono">Next Meeting</span>
          <strong>
            {nextMeeting?.data?.date
              ? formatDate(nextMeeting.data.date, true, settings.dateTime)
              : 'Not scheduled'}
          </strong>
        </StyledMilestoneRow>
        <StyledMilestoneRow>
          <span className="mono">Target</span>
          <strong>
            {targetPage
              ? `Chapter ${targetChapter} (Page ${targetPage})`
              : 'Set after progress reports begin'}
          </strong>
        </StyledMilestoneRow>
        <StyledMilestoneRow>
          <span className="mono">Team Size</span>
          <strong>{members?.length || 0} readers</strong>
        </StyledMilestoneRow>
      </StyledSectionCard>

      <StyledSectionCard className="surface hover-lift">
        <StyledSectionHeader>
          <h2>Recent Marginalia</h2>
          <StyledPrimaryAction
            to={nextMeeting ? `/meetings/${nextMeeting.docId}` : '/meetings'}
            className="focus-ring"
          >
            Enter Threads
          </StyledPrimaryAction>
        </StyledSectionHeader>
        <StyledNotesList>
          {activeNotes.length ? (
            activeNotes.map((note) => (
              <StyledNoteCard key={`${note.meetingId}-${note.dateAdded}-${note.text.slice(0, 12)}`}>
                <strong>
                  Note on Page [{note.citation?.page ?? '--'}]
                </strong>
                <p>{note.title || note.text}</p>
              </StyledNoteCard>
            ))
          ) : (
            <p>No discourse yet. Start a note in your next meeting thread.</p>
          )}
        </StyledNotesList>
      </StyledSectionCard>

      <StyledSectionCard className="surface hover-lift">
        <StyledSectionHeader>
          <h2>Member Presence</h2>
          <StyledMetaLabel className="mono">
            Live accountability snapshot
          </StyledMetaLabel>
        </StyledSectionHeader>
        <MemberList />
      </StyledSectionCard>
    </StyledDashboardGrid>
  );
};
