import {RangeHighlight} from "@/api/indexType.ts";

export type SingleHighlightSchema = {
    color: string
    biblical: RangeHighlight
    historical: RangeHighlight
}

export type HighlightSchema = {
    [highlightId: string]: SingleHighlightSchema
}

export async function changeHighlight(id: number | string, newHighlight: SingleHighlightSchema) {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/updateQuote/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHighlight),
    })

    if (!res.ok)
        throw new Error(`Error cannot update highlight`);
}

export async function deleteHighlight(id: number | string) {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/deleteQuote/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok)
        throw new Error(`Errore durante l'eliminazione dell'evidenziazione`)
}

export async function readHighlight(biblicalID: number, historicalID: number) {
    const params = new URLSearchParams({
        'biblical_text_id': String(biblicalID),
        'historical_text_id': String(historicalID)
    })

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/getQuotes?${params}`)

    if (!res.ok)
        throw new Error('Highlight non trovata');
    if (res.status === 204)
        return {} as HighlightSchema

    return await res.json() as HighlightSchema
}
