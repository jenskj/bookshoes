import { Club, SwiperNavigationButtons } from '@components';
import { db } from '@firestore';
import { useCurrentUserStore } from '@hooks';
import { ClubInfo, FirestoreClub } from '@types';
import {
  DocumentData,
  QuerySnapshot,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';
import { StyledClubsContainer } from './styles';

export const Clubs = () => {
  const [clubs, setClubs] = useState<FirestoreClub[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  // Used to force a rerender since activeIndex isn't updated properly in react/swiper (known bug)
  const [, setActiveIndex] = useState(1);
  const { currentUser } = useCurrentUserStore();

  useEffect(() => {
    const unsubscribeClubs = onSnapshot(
      collection(db, 'clubs'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const newClubs = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as ClubInfo,
        })) as FirestoreClub[];
        setClubs(newClubs);
      }
    );
    return () => {
      unsubscribeClubs();
    };
  }, [setClubs]);

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
          {/* Member clubs */}
          <StyledClubsContainer>
            {clubs.map(
              (club) =>
                currentUser?.data.memberships?.includes(club.docId) && (
                  <Link key={club.docId} to={`/clubs/${club.docId}`}>
                    <Club club={club} />
                  </Link>
                )
            )}
          </StyledClubsContainer>
        </SwiperSlide>
        <SwiperSlide>
          {/* Non-member clubs */}
          <StyledClubsContainer>
            {clubs.map(
              (club) =>
                !currentUser?.data.memberships?.includes(club.docId) && (
                  <Link key={club.docId} to={`/clubs/${club.docId}`}>
                    <Club club={club} />
                  </Link>
                )
            )}
          </StyledClubsContainer>
        </SwiperSlide>
      </ReactSwiper>
    </div>
  );
};
