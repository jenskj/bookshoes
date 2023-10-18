import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { FirestoreBook } from '../../types';
import { ImageSize, getBookImageUrl } from '../../utils/getBookImageUrl';
import { BookStatusIcon } from './BookStatusIcon';
import {
  StyledBookAuthor,
  StyledBookCard,
  StyledBookCover,
  StyledBookTitle,
} from './styles';

type BookProps = {
  book: FirestoreBook;
  showDetails?: boolean;
  large?: boolean;
  onClick?: () => void;
};

export const BookListItem = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  showDetails = true,
  large = false,
  onClick,
}: BookProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageSize, setImageSize] = useState<ImageSize>({ w: '130', h: '260' });

  useEffect(() => {
    if (isMobile) {
      setImageSize({ w: '188', h: '334' });
    } else {
      if (large) {
        // This is for the image on the meeting details page. On mobile this is quite small and works fine with the dimensions set above
        setImageSize({ w: '500', h: '1000' });
      }
    }
  }, [large, isMobile]);
  return (
    <StyledBookCard onClick={onClick}>
      <StyledBookCover
        src={getBookImageUrl(id, imageSize)}
        alt={volumeInfo?.title}
      />

      {showDetails && (
        <>
          <StyledBookTitle title={volumeInfo?.title}>
            {volumeInfo?.title}
          </StyledBookTitle>
          <StyledBookAuthor
            title={
              volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
            }
          >
            {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
          </StyledBookAuthor>
          <BookStatusIcon readStatus={readStatus}></BookStatusIcon>
        </>
      )}
    </StyledBookCard>
  );
};
