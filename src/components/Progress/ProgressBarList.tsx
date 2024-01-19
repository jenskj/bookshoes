import { useEffect, useState } from 'react';
import shortid from 'shortid';
import { useCurrentUserStore } from '../../hooks';
import { FirestoreBook } from '../../types';
import { ProgressBar } from './ProgressBar';
import { StyledProgressBarList } from './styles';

interface ProgressBarListProps {
  book?: FirestoreBook;
}

interface ProgressBarInfo {
  currentPage: number;
  memberId: string;
}

export const ProgressBarList = ({ book }: ProgressBarListProps) => {
  const { activeClub } = useCurrentUserStore();
  const [progressBarData, setProgressData] = useState<ProgressBarInfo[] | null>(
    null
  );

  useEffect(() => {
    // Get members of the current activeClub
    const members = activeClub?.data.members;
    // Get the progress log for the current book for each member
    const progressBars = members?.map((member) => {
      const currentBookData = member.data.meetingData?.find(
        (item) => item.bookId === book?.data.id
      );
      return {
        currentPage: currentBookData?.progressLog?.currentPage || 0,
        memberId: member.docId,
      };
    });

    if (progressBars?.length) {
      setProgressData(progressBars);
    }
  }, [activeClub, book]);

  return (
    <StyledProgressBarList>
      {progressBarData?.map((progressData) =>
        progressData.currentPage ? (
          <ProgressBar
            key={shortid.generate()}
            currentPage={progressData.currentPage}
          />
        ) : null
      )}
    </StyledProgressBarList>
  );
};
