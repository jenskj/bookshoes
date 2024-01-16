import { useCallback, useEffect, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import AddIcon from '@mui/icons-material/Add';
import {
  EmptyFallbackLink,
  MeetingForm,
  MeetingList,
  SwiperNavigationButtons
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
    if (displayedMeetings || meetings) {
      const upcoming = (displayedMeetings || meetings)?.filter(
        (meeting) =>
          meeting.data.date && meeting.data.date.toDate() > new Date()
      );
      const past = (displayedMeetings || meetings)?.filter(
        (meeting) =>
          meeting.data.date && meeting.data.date.toDate() < new Date()
      );
      setSortedMeetings({ upcoming, past });
    }
  }, [displayedMeetings, meetings]);

  useEffect(() => {
    if (meetings?.length) {
      updateSortedMeetings();
    }
  }, [displayedMeetings, meetings, sortedMeetings?.past.length, sortedMeetings?.upcoming.length, updateSortedMeetings]);

  useEffect(() => {
    if (sortedMeetings) {
      console.log(sortedMeetings);
      for (const key in sortedMeetings) {
        if (sortedMeetings[key as keyof SortedMeetings]?.length) {
          setSlides((prev) => [...prev, { title: key }]);
        }
      }
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
            slidesPerView={1}
            onSwiper={setSwiperInstance}
            preventClicks={false}
            touchStartPreventDefault={false}
            preventClicksPropagation={false}
          >
            <SwiperSlide>
              {/* All meetings */}
              <MeetingList meetings={meetings} books={books} />
            </SwiperSlide>
            {sortedMeetings?.upcoming?.length ? (
              <SwiperSlide>
                {/* Upcoming meetings */}
                <MeetingList
                  meetings={sortedMeetings?.upcoming}
                  books={books}
                />
              </SwiperSlide>
            ) : null}
            {sortedMeetings?.past?.length ? (
              <SwiperSlide>
                {/* Past meetings */}
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
