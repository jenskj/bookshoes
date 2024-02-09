import { create } from 'zustand';
import { FirestoreClub, FirestoreMember, FirestoreUser } from '../types';

interface UserStore {
  // To do: maybe these should be under one 'currentUser' state?
  currentUser?: FirestoreUser;
  activeClub?: FirestoreClub;
  membershipClubs?: FirestoreClub[];
  members?: FirestoreMember[];
  setCurrentUser: (newUser?: FirestoreUser) => void;
  setActiveClub: (newClub?: FirestoreClub) => void;
  setMembers: (newMembers?: FirestoreMember[]) => void;
  setMembershipClubs: (newClubs?: FirestoreClub[]) => void;
}

export const useCurrentUserStore = create<UserStore>((set) => ({
  currentUser: undefined,
  currentClub: undefined,
  membershipClubs: undefined,
  members: undefined,
  setCurrentUser: (currentUser) =>
    set(() => ({
      currentUser,
    })),
  setActiveClub: (activeClub) =>
    set(() => ({
      activeClub,
    })),
  setMembers: (members) =>
    set(() => ({
      members,
    })),
  setMembershipClubs: (membershipClubs) =>
    set(() => ({
      membershipClubs,
    })),
}));
