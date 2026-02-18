import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_USER_SETTINGS } from '@lib/userSettings';
import { Club, Member, User, UserSettings } from '@types';

interface UserStore {
  currentUser?: User;
  activeClub?: Club;
  membershipClubs?: Club[];
  members?: Member[];
  settings: UserSettings;
  clubContextCollapsed: boolean;
  setCurrentUser: (newUser?: User) => void;
  setActiveClub: (newClub?: Club) => void;
  setMembers: (newMembers?: Member[]) => void;
  setMembershipClubs: (newClubs?: Club[]) => void;
  setSettings: (newSettings: UserSettings) => void;
  setClubContextCollapsed: (collapsed: boolean) => void;
}

export const useCurrentUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: undefined,
      activeClub: undefined,
      membershipClubs: undefined,
      members: undefined,
      settings: DEFAULT_USER_SETTINGS,
      clubContextCollapsed: DEFAULT_USER_SETTINGS.clubContext.defaultCollapsed,
      setCurrentUser: (currentUser) => set(() => ({ currentUser })),
      setActiveClub: (activeClub) => set(() => ({ activeClub })),
      setMembers: (members) => set(() => ({ members })),
      setMembershipClubs: (membershipClubs) => set(() => ({ membershipClubs })),
      setSettings: (settings) => set(() => ({ settings })),
      setClubContextCollapsed: (clubContextCollapsed) =>
        set(() => ({ clubContextCollapsed })),
    }),
    {
      name: 'bookshoes-user-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeClub: state.activeClub,
        settings: state.settings,
        clubContextCollapsed: state.clubContextCollapsed,
      }),
    }
  )
);
