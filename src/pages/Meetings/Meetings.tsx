import { useCallback, useEffect, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import {
  EmptyFallbackLink,
  ExtendPreviewButton,
  FloatingActionButton,
  MeetingForm,
  MeetingList,
  SwiperNavigationButtons,
} from '@components';
import { useBookStore, useMeetingStore } from '@hooks';

import { FirestoreMeeting, PageSlide } from '@types';
import isBefore from 'date-fns/isBefore';
import { StyledMeetings } from './styles';

interface MeetingsProps {
  isPreview?: boolean;
}

interface SortedMeetings {
  upcoming: FirestoreMeeting[];
  past: FirestoreMeeting[];
}

export const Meetings = ({ isPreview = false }: MeetingsProps) => {
  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  // Used to force a rerender since activeIndex isn't updated properly in react/swiper (known bug)
  const [, setActiveIndex] = useState(1);
  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [sortedMeetings, setSortedMeetings] = useState<SortedMeetings | null>(
    null
  );
  const [slides, setSlides] = useState<PageSlide[]>([{ title: 'all' }]);

  const updateSortedMeetings = useCallback(() => {
    if (meetings?.length) {
      const upcoming = meetings?.filter(
        (meeting) =>
          meeting.data.date && isBefore(new Date(), meeting.data.date.toDate())
      );
      const past = meetings?.filter(
        (meeting) =>
          meeting.data.date && isBefore(meeting.data.date.toDate(), new Date())
      );
      if (past?.length || upcoming?.length) {
        setSortedMeetings({ upcoming, past });
      }
    }
  }, [meetings]);

  useEffect(() => {
    if (meetings) {
      // I don't understand why this is even necessary - why doesn't the useCallback fire correctly whenever "meetings" changes?
      updateSortedMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetings]);

  useEffect(() => {
    if (sortedMeetings === null) {
      updateSortedMeetings();
    }

    if (sortedMeetings?.upcoming?.length || sortedMeetings?.past?.length) {
      Object.keys(sortedMeetings)?.forEach((key) => {
        if (sortedMeetings[key as keyof SortedMeetings]?.length) {
          setSlides((prev) => [...prev, { title: key }]);
        }
      });
    }
    return () => {
      setSlides([{ title: 'all' }]);
    };
  }, [sortedMeetings, updateSortedMeetings]);

  const openModal = (index: number | null) => {
    if (index !== null) {
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  const closeModal = () => {
    setActiveModal(false);
    updateSortedMeetings();
  };

  const onSlideChange = (index: number) => setActiveIndex(index);

  return (
    <StyledMeetings>
      {meetings?.length && !isPreview ? (
        <>
          <SwiperNavigationButtons
            onSwipe={(index: number) => swiperInstance?.slideTo(index)}
            activeIndex={swiperInstance?.activeIndex || 0}
            slides={slides}
          />
          <ReactSwiper
            onSlideChange={(swiper) => onSlideChange(swiper.activeIndex + 1)}
            spaceBetween={50}
            slidesPerView={1}
            onSwiper={setSwiperInstance}
            preventClicks={false}
            touchStartPreventDefault={false}
            preventClicksPropagation={false}
          >
            {meetings?.length ? (
              <SwiperSlide>
                <MeetingList meetings={meetings} books={books} />
              </SwiperSlide>
            ) : null}
            {sortedMeetings?.upcoming?.length ? (
              <SwiperSlide>
                <MeetingList
                  meetings={sortedMeetings?.upcoming}
                  books={books}
                />
              </SwiperSlide>
            ) : null}
            {sortedMeetings?.past?.length ? (
              <SwiperSlide>
                <MeetingList meetings={sortedMeetings?.past} books={books} />
              </SwiperSlide>
            ) : null}
          </ReactSwiper>
        </>
      ) : null}
      {/* Add new meeting button */}
      {!isPreview && <FloatingActionButton onClick={() => openModal(null)} />}
      {sortedMeetings?.upcoming?.length && isPreview ? (
        <>
          <MeetingList meetings={sortedMeetings?.upcoming} books={books} />
          <ExtendPreviewButton direction="vertical" destination="meetings" />
        </>
      ) : isPreview ? (
        <EmptyFallbackLink
          title="No upcoming meetings"
          buttonText="Go schedule one"
          link="meetings"
        />
      ) : null}

      {!meetings?.length && !isPreview ? (
        <EmptyFallbackLink title="No meetings" />
      ) : null}

      {/* Meeting form modal */}
      <MeetingForm
        currentId={activeMeeting?.docId}
        open={activeModal}
        onClose={closeModal}
      />
    </StyledMeetings>
  );
};
