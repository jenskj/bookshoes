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
      onClick={() =>
        shelfType === 0 ? swiper?.slideNext() : swiper?.slidePrev()
      }
    >
      {shelfType === 0 ? 'Search' : 'Back'}
    </StyledNavigationButton>
  );
};
