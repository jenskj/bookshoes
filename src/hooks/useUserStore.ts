import { create } from 'zustand';
import { FirestoreUser } from '../types';

interface UserStore {
  users: FirestoreUser[];
  setUsers: (newUser: FirestoreUser[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) =>
    set(() => ({
      users,
    })),
}));
