import { BookStatusIcon } from '@components/Book/BookStatusIcon';
import {
  StyledBookCover,
  StyledBookCoverContainer,
} from '@components/Book/styles';
import { useMediaQuery, useTheme } from '@mui/material';
import { BookInfo } from '@types';
import { ImageSize, getBookImageUrl } from '@utils';
import { useMemo } from 'react';

interface BookCoverProps {
  bookInfo: BookInfo;
  showStatus?: boolean;
  size?: 'S' | 'M' | 'L';
}

export const BookCover = ({
  bookInfo,
  showStatus = false,
  size = 'S',
}: BookCoverProps) => {
  const { volumeInfo, readStatus } = bookInfo;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const imageSize = useMemo<ImageSize>(() => {
    if (size === 'L' && !isMobile) {
      return { w: '420', h: '760' };
    }
    if (isMobile) {
      return { w: '160', h: '280' };
    }
    return { w: '130', h: '220' };
  }, [isMobile, size]);

  return (
    <StyledBookCoverContainer>
      <StyledBookCover
        src={getBookImageUrl(bookInfo, imageSize)}
        alt={volumeInfo?.title}
        loading={size === 'L' ? 'eager' : 'lazy'}
        decoding="async"
      />
      {showStatus && (
        <BookStatusIcon
          readStatus={readStatus}
        ></BookStatusIcon>
      )}
    </StyledBookCoverContainer>
  );
};
