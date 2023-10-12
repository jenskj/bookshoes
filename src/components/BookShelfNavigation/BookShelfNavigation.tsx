import { useSwiper } from 'swiper/react';
import { StyledNavigationButton } from './styles';

type BookShelfNavigationProps = {
  shelfType: number;
};

export const BookShelfNavigation = ({
  shelfType,
}: BookShelfNavigationProps) => {
  const swiper = useSwiper();

  return (
    <StyledNavigationButton
      size="small"
      variant="contained"
      color='success'
      onClick={() =>
        shelfType === 0 ? swiper?.slideNext() : swiper?.slidePrev()
      }
    >
      {shelfType === 0 ? 'Add new books' : 'Back'}
    </StyledNavigationButton>
  );
};
