import {router} from "@/utils/router.tsx";
import toast from "react-hot-toast";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    console.log(input)
    const res = await fetch(input, {
        ...init,
        credentials: "include",
    })

    if (res.status === 401){
        const error = (await res.json()).detail
        if (error === "Token expired")
            toast.error("Sessione scaduta. Effettua nuovamente il login",{ id: "unauthorized" })

        await router.navigate('/login')
        throw new Error('UNAUTHORIZED')
    }

    return res
}

