import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Club, Member, User } from '../types';

interface UserStore {
  currentUser?: User;
  activeClub?: Club;
  membershipClubs?: Club[];
  members?: Member[];
  clubContextCollapsed: boolean;
  setCurrentUser: (newUser?: User) => void;
  setActiveClub: (newClub?: Club) => void;
  setMembers: (newMembers?: Member[]) => void;
  setMembershipClubs: (newClubs?: Club[]) => void;
  setClubContextCollapsed: (collapsed: boolean) => void;
}

export const useCurrentUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: undefined,
      activeClub: undefined,
      membershipClubs: undefined,
      members: undefined,
      clubContextCollapsed: false,
      setCurrentUser: (currentUser) => set(() => ({ currentUser })),
      setActiveClub: (activeClub) => set(() => ({ activeClub })),
      setMembers: (members) => set(() => ({ members })),
      setMembershipClubs: (membershipClubs) => set(() => ({ membershipClubs })),
      setClubContextCollapsed: (clubContextCollapsed) =>
        set(() => ({ clubContextCollapsed })),
    }),
    {
      name: 'bookshoes-user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeClub: state.activeClub,
        clubContextCollapsed: state.clubContextCollapsed,
      }),
    }
  )
);
