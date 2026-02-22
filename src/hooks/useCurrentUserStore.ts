import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_USER_SETTINGS } from '@lib/userSettings';
import { Club, Member, User, UserRole, UserSettings } from '@types';

interface MemberPresence {
  lastOnlineAt: string;
  isOnline: boolean;
}

interface UserStore {
  currentUser?: User;
  activeClub?: Club;
  membershipClubs?: Club[];
  membershipRolesByClubId: Record<string, UserRole>;
  members?: Member[];
  presenceByUserId: Record<string, MemberPresence>;
  settings: UserSettings;
  clubContextCollapsed: boolean;
  setCurrentUser: (newUser?: User) => void;
  setActiveClub: (newClub?: Club) => void;
  setMembers: (newMembers?: Member[]) => void;
  upsertMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  setPresenceByUserId: (presence: Record<string, MemberPresence>) => void;
  upsertPresence: (userId: string, presence: MemberPresence) => void;
  removePresence: (userId: string) => void;
  setMembershipClubs: (newClubs?: Club[]) => void;
  setMembershipRolesByClubId: (rolesByClubId: Record<string, UserRole>) => void;
  setMembershipRoleForClub: (clubId: string, role: UserRole) => void;
  clearMembershipRoleForClub: (clubId: string) => void;
  setSettings: (newSettings: UserSettings) => void;
  setClubContextCollapsed: (collapsed: boolean) => void;
}

export const useCurrentUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: undefined,
      activeClub: undefined,
      membershipClubs: undefined,
      membershipRolesByClubId: {},
      members: undefined,
      presenceByUserId: {},
      settings: DEFAULT_USER_SETTINGS,
      clubContextCollapsed: DEFAULT_USER_SETTINGS.clubContext.defaultCollapsed,
      setCurrentUser: (currentUser) => set(() => ({ currentUser })),
      setActiveClub: (activeClub) => set(() => ({ activeClub })),
      setMembers: (members) => set(() => ({ members: members ?? [] })),
      upsertMember: (member) =>
        set((state) => {
          const members = state.members ?? [];
          const index = members.findIndex((entry) => entry.docId === member.docId);
          if (index === -1) {
            return { members: [...members, member] };
          }
          const nextMembers = [...members];
          nextMembers[index] = member;
          return { members: nextMembers };
        }),
      removeMember: (memberId) =>
        set((state) => ({
          members: (state.members ?? []).filter((member) => member.docId !== memberId),
        })),
      setPresenceByUserId: (presenceByUserId) => set(() => ({ presenceByUserId })),
      upsertPresence: (userId, presence) =>
        set((state) => ({
          presenceByUserId: {
            ...state.presenceByUserId,
            [userId]: presence,
          },
        })),
      removePresence: (userId) =>
        set((state) => {
          const nextPresence = { ...state.presenceByUserId };
          delete nextPresence[userId];
          return { presenceByUserId: nextPresence };
        }),
      setMembershipClubs: (membershipClubs) => set(() => ({ membershipClubs })),
      setMembershipRolesByClubId: (membershipRolesByClubId) =>
        set(() => ({ membershipRolesByClubId })),
      setMembershipRoleForClub: (clubId, role) =>
        set((state) => ({
          membershipRolesByClubId: {
            ...state.membershipRolesByClubId,
            [clubId]: role,
          },
        })),
      clearMembershipRoleForClub: (clubId) =>
        set((state) => {
          if (!state.membershipRolesByClubId[clubId]) return {};
          const nextRoles = { ...state.membershipRolesByClubId };
          delete nextRoles[clubId];
          return { membershipRolesByClubId: nextRoles };
        }),
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
