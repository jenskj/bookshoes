import type { VolumeInfo } from '@types';
import { StyledBookAuthor, StyledBookHeader, StyledBookTitle } from './styles';

interface BookHeaderProps {
  volumeInfo: VolumeInfo;
}

export const BookHeader = ({
  volumeInfo: { title, authors },
}: BookHeaderProps) => {
  return (
    <StyledBookHeader>
      <StyledBookTitle title={title}>{title}</StyledBookTitle>
      <StyledBookAuthor title={authors ? authors.join(', ') : 'Unknown author'}>
        by {authors ? authors.join(', ') : 'Unknown author'}
      </StyledBookAuthor>
    </StyledBookHeader>
  );
};
