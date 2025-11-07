import { create } from 'zustand';

const useUserStore = create((set) => ({
  // State
  currentUser: null,
  users: [],
  isAuthenticated: false,

  // Actions
  setCurrentUser: (user) => 
    set({ currentUser: user, isAuthenticated: !!user }),

  setUsers: (users) => 
    set({ users }),

  logout: () => 
    set({ currentUser: null, isAuthenticated: false }),
}));

export default useUserStore;
