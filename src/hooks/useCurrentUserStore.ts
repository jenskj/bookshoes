import { create } from 'zustand';
import { FirestoreClub, FirestoreUser } from '../types';

interface UserStore {
  // To do: maybe these should be under one 'currentUser' state?
  currentUser?: FirestoreUser;
  activeClub?: FirestoreClub;
  membershipClubs?: FirestoreClub[];
  setCurrentUser: (newUser?: FirestoreUser) => void;
  setActiveClub: (newClub?: FirestoreClub) => void;
  setMembershipClubs: (newClubs?: FirestoreClub[]) => void;
}

export const useCurrentUserStore = create<UserStore>((set) => ({
  currentUser: undefined,
  currentClub: undefined,
  membershipClubs: undefined,
  setCurrentUser: (currentUser) =>
    set(() => ({
      currentUser,
    })),
  setActiveClub: (activeClub) =>
    set(() => ({
      activeClub,
    })),
  setMembershipClubs: (membershipClubs) =>
    set(() => ({
      membershipClubs,
    })),
}));
