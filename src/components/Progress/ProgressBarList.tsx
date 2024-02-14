import { useCurrentUserStore } from '../../hooks';
import { FirestoreBook } from '../../types';
import { updateDocument } from '../../utils';
import { ProgressBar } from './ProgressBar';
import { StyledProgressBarList } from './styles';

interface ProgressBarListProps {
  book?: FirestoreBook;
}

export const ProgressBarList = ({ book }: ProgressBarListProps) => {
  const { activeClub, currentUser, members } = useCurrentUserStore();

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
    updateDocument(
      `clubs/${activeClub?.docId}/books`,
      { progressReports: updatedProgressReports },
      book?.docId
    );
  };

  return (
    <StyledProgressBarList>
      {members?.length
        ? members.map((member) => (
            <ProgressBar
              key={member.docId}
              totalPages={book?.data.volumeInfo?.pageCount || 0}
              progressData={book?.data.progressReports?.find(
                (report) => report.user.uid === member.data.uid
              )}
              member={member.data}
              onUpdateProgress={(page) => handleUpdateProgress(page)}
            />
          ))
        : null}
    </StyledProgressBarList>
  );
};
