import { useCurrentUserStore } from '@hooks';
import { Book, Member } from '@types';
import { updateBook } from '@utils';
import { useMemo } from 'react';
import { ProgressBar } from './ProgressBar';
import { StyledEmptyProgressState, StyledProgressBarList } from './styles';

interface ProgressBarListProps {
  book?: Book;
}

export const ProgressBarList = ({ book }: ProgressBarListProps) => {
  const { activeClub, currentUser, members, settings } = useCurrentUserStore();
  const shareReadingProgress = settings.privacy.shareReadingProgress;
  const sortedMembers = useMemo(() => {
    if (!members?.length) return [];
    const membersToRender = shareReadingProgress
      ? members
      : members.filter((member) => member.data.uid !== currentUser?.docId);

    return [...membersToRender].sort((a: Member, b: Member) => {
      const aMemberProgress =
        book?.data.progressReports?.find(
          (report) => report.user.uid === a.data.uid
        )?.currentPage || 0;
      const bMemberProgress =
        book?.data.progressReports?.find(
          (report) => report.user.uid === b.data.uid
        )?.currentPage || 0;
      if (aMemberProgress > bMemberProgress) {
        return -1;
      }
      if (aMemberProgress < bMemberProgress) {
        return 1;
      }
      return 0;
    });
  }, [book?.data.progressReports, currentUser?.docId, members, shareReadingProgress]);

  const handleUpdateProgress = (page: number) => {
    if (!shareReadingProgress) {
      return;
    }
    if (!book?.docId || !activeClub?.docId) {
      return;
    }

    let updatedProgressReports;
    const currentProgressReports = book?.data.progressReports;
    const userProgressReport = currentProgressReports?.find(
      (report) => report.user.uid === currentUser?.docId
    );

    if (userProgressReport) {
      // If the user already has a progress report, update it
      updatedProgressReports = currentProgressReports?.map((report) =>
        report.user.uid === currentUser?.docId
          ? { ...userProgressReport, currentPage: page }
          : report
      );
    } else {
      // If the user doesn't have a progress report, create one
      updatedProgressReports = [
        ...(currentProgressReports || []),
        {
          user: {
            ...currentUser?.data,
          },
          currentPage: page,
        },
      ];
    }
    // Update the progress report in the books collection
    updateBook(activeClub.docId, book.docId, {
      progressReports: updatedProgressReports,
    });
  };

  if (members === undefined) {
    return <StyledEmptyProgressState>Loading readers...</StyledEmptyProgressState>;
  }

  if (!members.length) {
    return (
      <StyledEmptyProgressState>
        No club members yet, so no reading progress to show.
      </StyledEmptyProgressState>
    );
  }

  if (!sortedMembers.length) {
    return (
      <StyledEmptyProgressState>
        Reading progress sharing is off, so no progress bars are shown.
      </StyledEmptyProgressState>
    );
  }

  return (
    <StyledProgressBarList values={sortedMembers} onReorder={() => null}>
      {sortedMembers.map((member) => (
        <ProgressBar
          key={member.docId}
          totalPages={book?.data.volumeInfo?.pageCount || 0}
          progressData={book?.data.progressReports?.find(
            (report) => report.user.uid === member.data.uid
          )}
          member={member.data}
          onUpdateProgress={(page) => handleUpdateProgress(page)}
        />
      ))}
    </StyledProgressBarList>
  );
};
