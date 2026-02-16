import { create } from 'zustand';
import { Club, Member, User } from '../types';

interface UserStore {
  // To do: maybe these should be under one 'currentUser' state?
  currentUser?: User;
  activeClub?: Club;
  membershipClubs?: Club[];
  members?: Member[];
  setCurrentUser: (newUser?: User) => void;
  setActiveClub: (newClub?: Club) => void;
  setMembers: (newMembers?: Member[]) => void;
  setMembershipClubs: (newClubs?: Club[]) => void;
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
