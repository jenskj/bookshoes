import { Club, SwiperNavigationButtons } from '@components';
import { supabase } from '@lib/supabase';
import { mapClubRow } from '@lib/mappers';
import { useCurrentUserStore } from '@hooks';
import { useMediaQuery, useTheme } from '@mui/material';
import type { Club as ClubType } from '@types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';
import { StyledClubsContainer } from './styles';

export const Clubs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [, setActiveIndex] = useState(1);
  const { currentUser, membershipClubs } = useCurrentUserStore();
  // Prefer store's membership clubs for "Your clubs" (loaded in App with session); fallback to filtering full list.
  const yourClubs = membershipClubs?.length ? membershipClubs : clubs.filter((c) => currentUser?.data.memberships?.includes(c.docId));
  const otherClubs = clubs.filter((c) => !currentUser?.data.memberships?.includes(c.docId));

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
        spaceBetween={isMobile ? 16 : 32}
        slidesPerView={1}
        onSwiper={setSwiperInstance}
        preventClicks={false}
        touchStartPreventDefault={false}
        preventClicksPropagation={false}
      >
        <SwiperSlide>
          <StyledClubsContainer>
            {yourClubs.map((club) => (
              <Link key={club.docId} to={`/clubs/${club.docId}`}>
                <Club club={club} />
              </Link>
            ))}
          </StyledClubsContainer>
        </SwiperSlide>
        <SwiperSlide>
          <StyledClubsContainer>
            {otherClubs.map((club) => (
              <Link key={club.docId} to={`/clubs/${club.docId}`}>
                <Club club={club} />
              </Link>
            ))}
          </StyledClubsContainer>
        </SwiperSlide>
      </ReactSwiper>
    </div>
  );
};
