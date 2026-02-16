import { useCurrentUserStore } from '@hooks';
import { Book, Member } from '@types';
import { updateBook } from '@utils';
import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { StyledProgressBarList } from './styles';

interface ProgressBarListProps {
  book?: Book;
}

export const ProgressBarList = ({ book }: ProgressBarListProps) => {
  const { activeClub, currentUser, members } = useCurrentUserStore();
  const [sortedMembers, setSortedMembers] = useState<Member[]>();

  useEffect(() => {
    if (members && book?.data.progressReports) {
      const sortedMembers = [...members].sort(
        (a: Member, b: Member) => {
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
        }
      );
      setSortedMembers(sortedMembers);
    }
  }, [members, book?.data.progressReports, setSortedMembers]);

  const handleUpdateProgress = (page: number) => {
    if (!book?.docId) {
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
    updateBook(activeClub!.docId, book.docId, { progressReports: updatedProgressReports });
  };

  return (
    <StyledProgressBarList values={members || []} onReorder={() => null}>
      {(sortedMembers || members)?.map((member) => (
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
