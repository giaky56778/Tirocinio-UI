import {authFetch} from "@/api/authFetch.ts";
import type {MeSchema} from "@/api/indexType.ts";

export async function login ({ username, password }: { username: string; password: string }) {

    const body = new URLSearchParams()
    body.append("username", username)
    body.append("password", password)
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/user/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body,
        credentials: "include"
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Login fallito: credenziali non valide")
    }

    return await res.json()
}

export async function me(){
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/user/me`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare le informazioni dell'utente")
    }

    return await res.json() as MeSchema
}

export async function logout(){
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/user/logout`, {
        method: 'POST'
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile fare logout")
    }
}

export async function pswChange({oldPassword, newPassword}:{oldPassword:string, newPassword:string}){
    const body = new URLSearchParams()
    body.append("old_password", oldPassword)
    body.append("new_password", newPassword)

    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/user/changePassword`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile cambiare la password")
    }
}