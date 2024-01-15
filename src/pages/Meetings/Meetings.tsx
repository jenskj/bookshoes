import { useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import {
  Meeting,
  MeetingForm,
  SwiperNavigationButtons,
} from '../../components';
import { useBookStore, useMeetingStore } from '../../hooks';
import { FirestoreMeeting } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import {
  StyledAddNewButton,
  StyledButtonWrapper,
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';

interface MeetingsProps {
  displayedMeetings?: FirestoreMeeting[];
}

export const Meetings = ({ displayedMeetings }: MeetingsProps) => {
  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  // Used to force a rerender since activeIndex isn't updated properly in react/swiper (known bug)
  const [, setActiveIndex] = useState(1);
  const [activeMeeting, setActiveMeeting] = useState<FirestoreMeeting>();
  const [activeModal, setActiveModal] = useState<boolean>(false);

  const openModal = (index: number | null) => {
    if (index !== null) {
      setActiveMeeting(meetings[index]);
    }
    setActiveModal(true);
  };

  const onSlideChange = (index: number) => setActiveIndex(index);

  return (
    <>
      <SwiperNavigationButtons
        onSwipe={(index) => swiperInstance?.slideTo(index)}
        activeIndex={swiperInstance?.activeIndex || 0}
        slides={[{ title: 'Upcoming meetings' }, { title: 'Past meetings' }]}
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
          <StyledMeetingList>
            <StyledMeetingContainer>
              {(meetings || displayedMeetings) &&
                (displayedMeetings || meetings).map((meeting) =>
                  meeting?.data?.date?.toDate() &&
                  meeting.data.date.toDate() > new Date() ? (
                    <StyledLink
                      key={meeting.docId}
                      to={`/meetings/${meeting.docId}`}
                    >
                      <Meeting
                        meeting={meeting.data}
                        books={books.filter(
                          (book) => book.data.scheduledMeeting === meeting.docId
                        )}
                      />
                    </StyledLink>
                  ) : null
                )}
            </StyledMeetingContainer>
          </StyledMeetingList>
        </SwiperSlide>
        <SwiperSlide>
          <StyledMeetingList>
            <StyledMeetingContainer>
              {(meetings || displayedMeetings) &&
                (displayedMeetings || meetings).map((meeting) =>
                  meeting?.data?.date?.toDate() &&
                  meeting.data.date.toDate() < new Date() ? (
                    <StyledLink
                      key={meeting.docId}
                      to={`/meetings/${meeting.docId}`}
                    >
                      <Meeting
                        meeting={meeting.data}
                        books={books.filter(
                          (book) => book.data.scheduledMeeting === meeting.docId
                        )}
                      />
                    </StyledLink>
                  ) : null
                )}
            </StyledMeetingContainer>
          </StyledMeetingList>
        </SwiperSlide>
      </ReactSwiper>

      <MeetingForm
        currentId={activeMeeting?.docId}
        open={activeModal}
        onClose={() => setActiveModal(false)}
      />
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
