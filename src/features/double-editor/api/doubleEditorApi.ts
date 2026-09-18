import type {RangeHighlight} from "@/api/indexType.ts";
import {authFetch} from "@/api/authFetch.ts";

export type SingleHighlightSchema = {
    color: string
    biblical: RangeHighlight
    historical: RangeHighlight
}

export type HighlightSchema = {
    [highlightId: string]: SingleHighlightSchema
}

export async function changeHighlight(id: number | string, newHighlight: SingleHighlightSchema) {
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/quote/updateQuote/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHighlight)
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile cambiare l'evidenziazione")
    }
}

export async function deleteHighlight(id: number | string) {
    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/quote/deleteQuote/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile eliminare l'evidenziazione")
    }
}

export async function readHighlight(biblicalID: number, historicalID: number) {
    const params = new URLSearchParams({
        'biblical_text_id': String(biblicalID),
        'historical_text_id': String(historicalID)
    })

    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/quote/getQuotes?${params}`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare l'evidenziazione")
    }
    if (res.status === 204)
        return {} as HighlightSchema

    return await res.json() as HighlightSchema
}
