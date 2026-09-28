import {create} from "zustand";
import type {MeSchema} from "@/api/indexType.ts";

type AuthStoreType = {
    isAuthenticated: boolean | null
    user: MeSchema | null
    isLoading: boolean
    redirectUrl: string | null

    setAuth: (authenticated: boolean, user?: MeSchema | null) => void
    setUser: (user: MeSchema | null) => void
    clearAuth: () => void
    setRedirectUrl: (url: string | null) => void
    clearRedirectUrl: () => void
}

export const useAuthStore = create<AuthStoreType>((set) => ({
    isAuthenticated: null,
    user: null,
    isLoading: true,
    redirectUrl: null,

    setAuth: (authenticated, user = null) => set({
        isAuthenticated: authenticated,
        user: user,
        isLoading: false
    }),

    setUser: (user) => set({ user }),

    clearAuth: () => set({
        isAuthenticated: false,
        user: null,
        isLoading: false
    }),

    setRedirectUrl: (url) => set({
        redirectUrl: url
    }),

    clearRedirectUrl: () => set({
        redirectUrl: null
    })
}))
