import { create } from "zustand";
import type { MeSchema } from "@/api/indexType.ts";

type AuthStoreType = {
    isAuthenticated: boolean | null;
    user: MeSchema | null;

    setAuth: (authenticated: boolean, user?: MeSchema | null) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthStoreType>((set) => ({
    isAuthenticated: null,
    user: null,

    setAuth: (authenticated, user = null) => set({
        isAuthenticated: authenticated,
        user: user
    }),

    clearAuth: () => set({
        isAuthenticated: false,
        user: null
    })
}))
