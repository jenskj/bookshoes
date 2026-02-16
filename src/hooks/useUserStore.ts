import { create } from 'zustand';
import { User } from '../types';

interface UserStore {
  users: User[];
  setUsers: (newUser: User[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) =>
    set(() => ({
      users,
    })),
}));
