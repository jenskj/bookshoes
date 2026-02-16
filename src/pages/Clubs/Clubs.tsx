import { Club, SwiperNavigationButtons } from '@components';
import { supabase } from '@lib/supabase';
import { mapClubRow } from '@lib/mappers';
import { useCurrentUserStore } from '@hooks';
import type { Club as ClubType } from '@types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';
import { StyledClubsContainer } from './styles';

export const Clubs = () => {
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [, setActiveIndex] = useState(1);
  const { currentUser } = useCurrentUserStore();

  useEffect(() => {
    const channel = supabase
      .channel('clubs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clubs' }, () => {
        supabase.from('clubs').select('*').then(({ data }) => {
          setClubs((data ?? []).map((c) => mapClubRow(c)));
        });
      })
      .subscribe();

    supabase.from('clubs').select('*').then(({ data }) => {
      setClubs((data ?? []).map((c) => mapClubRow(c)));
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onSlideChange = (index: number) => setActiveIndex(index);

  return (
    <div>
      <SwiperNavigationButtons
        onSwipe={(index) => swiperInstance?.slideTo(index)}
        activeIndex={swiperInstance?.activeIndex || 0}
        slides={[{ title: 'Your clubs' }, { title: 'Find new clubs' }]}
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
          <StyledClubsContainer>
            {clubs.map((club) =>
              currentUser?.data.memberships?.includes(club.docId) ? (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              ) : null
            )}
          </StyledClubsContainer>
        </SwiperSlide>
        <SwiperSlide>
          <StyledClubsContainer>
            {clubs.map((club) =>
              !currentUser?.data.memberships?.includes(club.docId) ? (
                <Link key={club.docId} to={`/clubs/${club.docId}`}>
                  <Club club={club} />
                </Link>
              ) : null
            )}
          </StyledClubsContainer>
        </SwiperSlide>
      </ReactSwiper>
    </div>
  );
};
