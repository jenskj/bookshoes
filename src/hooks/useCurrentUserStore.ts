import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Club, Member, User } from '../types';

interface UserStore {
  currentUser?: User;
  activeClub?: Club;
  membershipClubs?: Club[];
  members?: Member[];
  setCurrentUser: (newUser?: User) => void;
  setActiveClub: (newClub?: Club) => void;
  setMembers: (newMembers?: Member[]) => void;
  setMembershipClubs: (newClubs?: Club[]) => void;
}

export const useCurrentUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: undefined,
      activeClub: undefined,
      membershipClubs: undefined,
      members: undefined,
      setCurrentUser: (currentUser) => set(() => ({ currentUser })),
      setActiveClub: (activeClub) => set(() => ({ activeClub })),
      setMembers: (members) => set(() => ({ members })),
      setMembershipClubs: (membershipClubs) => set(() => ({ membershipClubs })),
    }),
    {
      name: 'bookshoes-user-store',
      partialize: (state) => ({ currentUser: state.currentUser, activeClub: state.activeClub }),
    }
  )
);
