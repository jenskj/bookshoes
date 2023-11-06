import { create } from 'zustand';
import { ClubInfo, FirestoreUser } from '../types';

interface UserStore {
  currentUser?: FirestoreUser;
  activeClub?: ClubInfo;
  setCurrentUser: (newUser: FirestoreUser) => void;
  setActiveClub: (newClub?: ClubInfo) => void;
}

export const useCurrentUserStore = create<UserStore>((set) => ({
  currentUser: undefined,
  currentClub: undefined,
  setCurrentUser: (currentUser) =>
    set(() => ({
      currentUser,
    })),
  setActiveClub: (activeClub) =>
    set(() => ({
      activeClub,
    })),
}));
