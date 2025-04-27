import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    auth: {
        username: '',
        active: false,
        role: null, // Add role to the auth object
    },
    setUsername: (name) => {
        set((state) => ({ auth: { ...state.auth, username: name } }));
    },
    setAuth: ({ active, role }) => {
        set((state) => ({ auth: { ...state.auth, active, role } })); // Update both active and role
    },
}));