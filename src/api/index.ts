import type {MeSchema, TextBundle, TextListSchema,} from "@/api/indexType.ts";
import {normalizeChapter} from "@/utils/commonUtil.ts";
import type {TextType} from "@/utils/settings.ts";
import {authFetch} from "@/api/authFetch.ts";

export type TextQuery={
    id?: number
    path?:string
    filename?:string
}

type Props = TextQuery & {
    textType: TextType
}

async function readText({textType,id, path, filename}:Props){
    const params = new URLSearchParams()

    if(path != undefined && filename != undefined){
        params.set('path', path)
        params.set('filename', filename)
    }
    else if(id != undefined)
        params.set('text_id', String(id))
    else
        throw new Error('Errore: è necessario fornire un id oppure i parametri path/filename')

    const endpoint = textType === "historical" ? "getHistoricalText" : "getBiblicalText"
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/${endpoint}/?${params}`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: file non trovato")
    }

    const json = await res.json() as TextBundle

    return {
        text: json.text,
        index: json.index,
        chapter: normalizeChapter(json.chapter),
        textId: json.textId
    } as TextBundle
}

export async function readHistoricalText({id, path, filename} :TextQuery) {
    return readText({textType:"historical",id, path, filename})
}

export async function readBiblicalText({id, path, filename} :TextQuery) {
    return readText({textType:"biblical",id, path, filename})
}

export async function getTextNameBiblical() {
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/getBiblicalTextNames`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare i testi biblici")
    }

    return await res.json() as TextListSchema
}

export async function getTextNameHistorical() {
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/getHistoricalTextNames`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: file non trovato")
    }

    return await res.json() as TextListSchema
}

export async function deleteText(id:number) {
    const params = new URLSearchParams({id: String(id)})
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/deleteHistoricalText?${params}`, {
        method: 'DELETE'
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile eliminare il testo storico designato")
    }
}

export async function login ({ username, password }: { username: string; password: string }) {

    const body = new URLSearchParams()
    body.append("username", username)
    body.append("password", password)
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/login`, {
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
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/me`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare le informazioni dell'utente")
    }

    return await res.json() as MeSchema
}

export async function logout(){
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/logout`, {
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

    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/changePassword`, {
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