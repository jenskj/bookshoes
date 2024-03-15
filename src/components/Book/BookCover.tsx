import { BookStatusIcon } from '@components/Book/BookStatusIcon';
import {
  StyledBookCover,
  StyledBookCoverContainer,
} from '@components/Book/styles';
import { useMediaQuery, useTheme } from '@mui/material';
import { BookInfo } from '@types';
import { ImageSize, getBookImageUrl } from '@utils';
import { useEffect, useState } from 'react';

interface BookCoverProps {
  bookInfo: BookInfo;
  showStatus?: boolean;
  size?: 'S' | 'M' | 'L';
}

export const BookCover = ({
  bookInfo: { volumeInfo, id, readStatus, scheduledMeetings },
  showStatus = false,
  size = 'S',
}: BookCoverProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [imageSize, setImageSize] = useState<ImageSize>({ w: '130', h: '260' });

  useEffect(() => {
    if (isMobile) {
      setImageSize({ w: '200', h: '400' });
    } else {
      if (size === 'L') {
        // This is for the image on the meeting details page. On mobile this is quite small and works fine with the dimensions set above
        setImageSize({ w: '500', h: '1000' });
      }
    }
  }, [size, isMobile]);

  return (
    <StyledBookCoverContainer>
      <StyledBookCover
        src={getBookImageUrl(id, imageSize)}
        alt={volumeInfo?.title}
      />
      {showStatus && (
        <BookStatusIcon
          readStatus={scheduledMeetings?.length ? 'reading' : 'candidate'}
        ></BookStatusIcon>
      )}
    </StyledBookCoverContainer>
  );
};
