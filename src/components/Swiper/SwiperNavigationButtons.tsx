import React from 'react';
import { StyledSwiperNavigation, StyledNavigationButton } from './styles';

// To do: make into real type
interface PageSlide {
  title: string;
  description?: string;
}

interface SwiperNavigationButtonsProps {
  slides: PageSlide[];
  activeIndex: number;
  onSwipe: (slideIndex: number) => void;
}

export const SwiperNavigationButtons = ({
  onSwipe,
  activeIndex,
  slides
}: SwiperNavigationButtonsProps) => {

  return (
    <StyledSwiperNavigation>
      {slides?.map((slide, index) => (
        <StyledNavigationButton
          variant={activeIndex === index ? 'contained' : 'text'}
          key={index}
          onClick={() => onSwipe(index)}
        >
          {slide.title}
        </StyledNavigationButton>
      ))}
    
    </StyledSwiperNavigation>
  );
};
