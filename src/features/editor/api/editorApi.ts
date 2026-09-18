import type {HighlightDouble} from "@/features/double-editor/components/doubleEditor.tsx";
import type {TextBundle} from "@/api/indexType.ts";
import {normalizeChapter} from "@/utils/commonUtil.ts";
import type {TextType} from "@/utils/settings.ts";
import {authFetch} from "@/api/authFetch.ts";

export type TextQueryPortion={
    id?: number
    path?:string
    filename?:string
    line?: number
    lineNumber?: string
    wordId?: number
}

type ExtendedTextQueryPortion = TextQueryPortion & {
    textType: TextType
}

export async function readHighlightPortion(biblicalID: number, historicalID: number, lineB: number, lineH: number) {
    const params = new URLSearchParams({
        'biblical_text_id': String(biblicalID),
        'historical_text_id': String(historicalID),
        'lineB': String(lineB),
        'lineH': String(lineH)
    })

    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/quote/getQuotesPortion?${params}`)

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare il testo designato")
    }
    if (res.status === 204)
        return {} as Record<string,HighlightDouble>

    return await res.json() as Record<string,HighlightDouble>
}

async function readTextPortion({textType,id, path, filename, line, lineNumber,wordId}:ExtendedTextQueryPortion){
    const params = new URLSearchParams()

    if(path != undefined && filename != undefined){
        params.set('path', path)
        params.set('filename', filename)
    }
    else if(id != undefined)
        params.set('text_id', String(id))
    else
        throw new Error('Errore: parametri non validi, inserire id o path e filename')

    if (lineNumber != undefined)
        params.set('lineNumber', lineNumber)
    else if (line != undefined)
        params.set('line', String(line))
    else if (wordId != undefined)
        params.set('wordId', String(wordId))

    const endpoint = textType === "historical" ? "getHistoricalTextPortion" : "getBiblicalTextPortion"

    const res = await authFetch(`${import.meta.env.VITE_SERVER_URL}/${import.meta.env.VITE_API_VERSION}/text/${endpoint}/?${params}`)


    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Errore: impossibile trovare il testo specificato")
    }

    const json = await res.json() as TextBundle

    return {
        text: json.text,
        index: json.index,
        chapter: normalizeChapter(json.chapter),
        textId: json.textId,
        startIndex: json.startIndex
    } as TextBundle
}

export async function readHistoricalTextPortion({id, path, filename, line, lineNumber,wordId} :TextQueryPortion) {
    return readTextPortion({textType:"historical",id, path, filename, line, lineNumber,wordId})
}

export async function readBiblicalTextPortion({id, path, filename, line, lineNumber,wordId} :TextQueryPortion) {
    return readTextPortion({textType:"biblical",id, path, filename, line, lineNumber,wordId})
}
