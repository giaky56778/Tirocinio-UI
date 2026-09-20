import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.ts";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, {
        ...init,
        credentials: "include"
    })

    if (res.status === 401) {
        const { isAuthenticated, clearAuth } = useAuthStore.getState()

        if (isAuthenticated === true) {
            toast.error("Sessione scaduta.\nEffettua nuovamente il login", { id: "unauthorized" })
            sessionStorage.setItem('redirect_after_login', window.location.pathname + window.location.search)
        }

        clearAuth()
        return new Promise(()=>{})
        //throw new Error('UNAUTHORIZED')
    }

    return res
}
