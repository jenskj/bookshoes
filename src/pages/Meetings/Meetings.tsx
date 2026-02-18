import { useEffect, useMemo, useState } from 'react';

import {
  EmptyFallbackLink,
  ExtendPreviewButton,
  FloatingActionButton,
  MeetingForm,
  MeetingList,
  SwiperNavigationButtons,
} from '@components';
import { useBookStore, useMeetingStore } from '@hooks';

import { Meeting, PageSlide } from '@types';
import { parseDate } from '@utils';
import isBefore from 'date-fns/isBefore';
import { StyledMeetings } from './styles';

interface MeetingsProps {
  isPreview?: boolean;
}

interface SortedMeetings {
  upcoming: Meeting[];
  past: Meeting[];
}

export const Meetings = ({ isPreview = false }: MeetingsProps) => {
  const meetings = useMeetingStore((state) => state.meetings);
  const books = useBookStore((state) => state.books);
  const [activeSlide, setActiveSlide] = useState<PageSlide['title']>('all');
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const sortedMeetings = useMemo<SortedMeetings>(() => {
    if (!meetings.length) {
      return { upcoming: [], past: [] };
    }
    const upcoming = meetings.filter((meeting) => {
      const d = parseDate(meeting.data.date);
      return d && isBefore(new Date(), d);
    });
    const past = meetings.filter((meeting) => {
      const d = parseDate(meeting.data.date);
      return d && isBefore(d, new Date());
    });
    return { upcoming, past };
  }, [meetings]);

  const slides = useMemo<PageSlide[]>(() => {
    const nextSlides: PageSlide[] = [{ title: 'all' }];
    if (sortedMeetings.upcoming.length) {
      nextSlides.push({ title: 'upcoming' });
    }
    if (sortedMeetings.past.length) {
      nextSlides.push({ title: 'past' });
    }
    return nextSlides;
  }, [sortedMeetings]);

  useEffect(() => {
    const slideStillAvailable = slides.some((slide) => slide.title === activeSlide);
    if (!slideStillAvailable) {
      setActiveSlide('all');
    }
  }, [activeSlide, slides]);

  const activeSlideIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.title === activeSlide)
  );
  const meetingsToRender =
    activeSlide === 'upcoming'
      ? sortedMeetings.upcoming
      : activeSlide === 'past'
        ? sortedMeetings.past
        : meetings;

  const openModal = () => {
    setActiveModal(true);
  };

  const closeModal = () => {
    setActiveModal(false);
  };

  return (
    <StyledMeetings>
      {meetings.length > 0 && !isPreview ? (
        <>
          <SwiperNavigationButtons
            onSwipe={(index: number) => {
              const next = slides[index];
              if (next) {
                setActiveSlide(next.title);
              }
            }}
            activeIndex={activeSlideIndex}
            slides={slides}
          />
          <MeetingList meetings={meetingsToRender} books={books} />
        </>
      ) : null}
      {/* Add new meeting button */}
      {!isPreview && <FloatingActionButton onClick={openModal} />}
      {sortedMeetings.upcoming.length > 0 && isPreview ? (
        <>
          <MeetingList meetings={sortedMeetings.upcoming} books={books} />
          <ExtendPreviewButton direction="vertical" destination="meetings" />
        </>
      ) : isPreview ? (
        <EmptyFallbackLink
          title="No upcoming meetings"
          buttonText="Go schedule one"
          link="meetings"
        />
      ) : null}

      {meetings.length === 0 && !isPreview ? (
        <EmptyFallbackLink title="No meetings" />
      ) : null}

      {/* Meeting form modal */}
      <MeetingForm
        open={activeModal}
        onClose={closeModal}
      />
    </StyledMeetings>
  );
};
