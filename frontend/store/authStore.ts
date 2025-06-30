import { create } from "zustand";

type AuthState = {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  login: (token, role) => {
    localStorage.setItem("token", token);
    set({ token, role });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, role: null });
  },
}));
