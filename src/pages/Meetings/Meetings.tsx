import { useCallback, useEffect, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import AddIcon from '@mui/icons-material/Add';
import {
  EmptyFallbackLink,
  MeetingForm,
  MeetingList,
  SwiperNavigationButtons,
} from '../../components';
import { useBookStore, useMeetingStore } from '../../hooks';
import { FirestoreMeeting, PageSlide } from '../../types';
import { StyledAddNewButton, StyledButtonWrapper } from './styles';

interface MeetingsProps {
  displayedMeetings?: FirestoreMeeting[];
}

interface SortedMeetings {
  upcoming: FirestoreMeeting[];
  past: FirestoreMeeting[];
}

export const Meetings = ({ displayedMeetings }: MeetingsProps) => {
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
          meeting.data.date && meeting.data.date.toDate() > new Date()
      );
      const past = meetings?.filter(
        (meeting) =>
          meeting.data.date && meeting.data.date.toDate() < new Date()
      );
      if (past?.length || upcoming?.length) {
        setSortedMeetings({ upcoming, past });
      }
    }
  }, [meetings]);

  useEffect(() => {
    if (sortedMeetings === null) {
      updateSortedMeetings();
    } else {
      Object.keys(sortedMeetings).forEach((key) => {
        if (sortedMeetings[key as keyof SortedMeetings]?.length) {
          setSlides((prev) => [...prev, { title: key }]);
        }
      });
    }
    return () => {
      setSlides([{ title: 'all' }]);
    };
  }, [sortedMeetings]);

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
    <>
      {displayedMeetings?.length || meetings?.length ? (
        <>
          <SwiperNavigationButtons
            onSwipe={(index) => swiperInstance?.slideTo(index)}
            activeIndex={swiperInstance?.activeIndex || 0}
            slides={slides}
          />
          <ReactSwiper
            onSlideChange={(swiper) => onSlideChange(swiper.activeIndex + 1)}
            spaceBetween={50}
            slidesPerView={'auto'}
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

          <MeetingForm
            currentId={activeMeeting?.docId}
            open={activeModal}
            onClose={closeModal}
          />
        </>
      ) : (
        <EmptyFallbackLink title="No meetings" />
      )}
      {!displayedMeetings && (
        <StyledButtonWrapper>
          <StyledAddNewButton onClick={() => openModal(null)}>
            <AddIcon />
          </StyledAddNewButton>
        </StyledButtonWrapper>
      )}
    </>
  );
};
