import {router} from "@/utils/router.tsx";
import toast from "react-hot-toast";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, {
        ...init,
        credentials: "include",
    })

    if (res.status === 401){
        
        toast.error("Sessione scaduta.\nEffettua nuovamente il login", {id: "unauthorized"})

        void router.navigate('/login', {
            replace: true, 
            state: {
                from: window.location.pathname + window.location.search
            }
        })
        throw new Error('UNAUTHORIZED')
    }

    return res
}
