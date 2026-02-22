import type { VolumeInfo } from '@types';
import { StyledBookAuthor, StyledBookTitle } from './styles';

interface BookHeaderProps {
  volumeInfo: VolumeInfo;
}

export const BookHeader = ({
  volumeInfo: { title, authors },
}: BookHeaderProps) => {
  return (
    <div>
      <StyledBookTitle title={title}>{title}</StyledBookTitle>
      <StyledBookAuthor title={authors ? authors.join(', ') : 'Unknown author'}>
        by {authors ? authors.join(', ') : 'Unknown author'}
      </StyledBookAuthor>
    </div>
  );
};
