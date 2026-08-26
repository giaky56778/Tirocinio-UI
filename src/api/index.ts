import {
    HighlightSchema,
    Range,
    SingleHighlightSchema,
    TextBundle,
    TextListSchema,
    TextSchema
} from "@/utils/JSONSchema.ts";
import {normalizeChapter} from "@/utils/util.ts";
import {Side} from "@/utils/globalType.ts";

export type SettingsType = {
    version: string,
    language: string,
    sources: Record<string, string>,
    sentence_transformer_models: Record<string, string>,
    explicit_algorithms: string[],
}

export type TooltipType={
    algo: Record<string, string>,
    strans: Record<string, string>
}

export type SearchResultText={
    found: string,
    confidency: number,
    algos: string[],
    source: string,
    urn: string,
    query: string,
    method: string,
    sources: string,
    idHistorical: number
}

export type SearchResultRange={
    startWordId: number,
    endWordId: number,
    startLine: number,
    endLine: number,
    error: -1|0|1
}

export type SearchResultType ={
    results:SingleSearchType[],
    lineIndex?:number
}

export type SingleSearchType = {
    text: SearchResultText,
    query?:string,
    range?: SearchResultRange
}

export type highlightHistoricalType = {
    color_id:string,
    biblical_text:TextSchema,
    historical_text:TextSchema,
    biblical_start_line: number,
    biblical_range_word:Range,
    historical_start_line: number,
    historical_range_word:Range

}

export type highlightTextType={
    filename:string,
    path:string,
    highlights:highlightHistoricalType[]
}

export type NewHighlightType={
    urn_h: string
    start_h: number
    end_h: number
    line_start_h: number

    b_id_text: number
    start_b: number
    end_b: number
}

export type ForToastType={
    h_path: string,
    h_filename: string,
    h_id: number,

    b_path: string,
    b_filename: string,
    line_start_b: number
}

export type AddNewHighlightsType={
    newHighlight: NewHighlightType,
    forToast:ForToastType
}

export type UploadBiblicalTextType = {
    path: string
    filename: string
    file?: File
    text?: string
}

export type UploadIdType={
    id:number
}

export type TextQuery={
    id?: number
    path?:string
    filename?:string
}

export type TextQueryPortion={
    id?: number
    path?:string
    filename?:string
    line?: number
    lineNumber?: string
    wordId?: number
}

type ExtendedTextQuery = TextQuery & {
    textType: Side
}

type ExtendedTextQueryPortion = TextQueryPortion & {
    textType: Side
}

async function readText({textType,id, path, filename}:ExtendedTextQuery){
    const params = new URLSearchParams()

    if(path != undefined && filename != undefined){
        params.set('path', path)
        params.set('filename', filename)
    }
    else if(id != undefined)
        params.set('text_id', String(id))
    else
        throw new Error('Invalid parameters: either id or (path and filename) must be provided')

    const endpoint = textType === "biblical" ? "getBiblicalText" : "getHistoricalText"
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/${endpoint}/?${params}`)

    console.log(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/${endpoint}/?${params}`)

    if (!res.ok)
        throw new Error('File non trovato')

    const json = await res.json() as TextBundle

    return {
        text: json.text,
        index: json.index,
        chapter: normalizeChapter(json.chapter),
        textId: json.textId
    } as TextBundle
}

export async function readBiblicalText({id, path, filename} :TextQuery) {
    return readText({textType:"biblical",id, path, filename})
}

export async function readHistoricalText({id, path, filename} :TextQuery) {
    return readText({textType:"historical",id, path, filename})
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
        throw new Error('Parametri non validi, inserire id o path e filename')

    if (lineNumber != undefined)
        params.set('lineNumber', lineNumber)
    else if (line != undefined)
        params.set('line', String(line))
    else if (wordId != undefined)
        params.set('wordId', String(wordId))

    const endpoint = textType === "biblical" ? "getBiblicalTextPortion" : "getHistoricalTextPortion"

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/${endpoint}/?${params}`)

    if (!res.ok)
        throw new Error(`Impossibile trovare il testo specificato, controllare se i campi sono stati inseriti correttamente`)

    const json = await res.json() as TextBundle

    return {
        text: json.text,
        index: json.index,
        chapter: normalizeChapter(json.chapter),
        textId: json.textId
    } as TextBundle
}

export async function readBiblicalTextPortion({id, path, filename, line, lineNumber,wordId} :TextQueryPortion) {
    return readTextPortion({textType:"biblical",id, path, filename, line, lineNumber,wordId})
}

export async function readHistoricalTextPortion({id, path, filename, line, lineNumber,wordId} :TextQueryPortion) {
    return readTextPortion({textType:"historical",id, path, filename, line, lineNumber,wordId})
}

export async function readHighlight(historicalID: number, biblicalID: number) {
    const params = new URLSearchParams({
        'historical_text_id': String(historicalID),
        'biblical_text_id': String(biblicalID)
    })

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/getQuotes?${params}`)

    if (!res.ok)
        throw new Error('Highlight non trovata');
    if (res.status === 204)
        return {} as HighlightSchema

    return await res.json() as HighlightSchema
}

export async function readHighlightPortion(historicalID: number, biblicalID: number, lineB: number, lineH: number) {
    const params = new URLSearchParams({
        'historical_text_id': String(historicalID),
        'biblical_text_id': String(biblicalID),
        'lineB': String(lineB),
        'lineH': String(lineH)
    })

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/getQuotesPortion?${params}`)

    if (!res.ok)
        throw new Error('Highlight non trovata');
    if (res.status === 204)
        return {} as HighlightSchema

    return await res.json() as HighlightSchema
}

export async function getTextNameHistorical() {
    console.log(('getTextNameHistorical'))
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/getHistoricalTextNames`);
    if (!res.ok)
        throw new Error('File non trovato')
    return await res.json() as TextListSchema
}

export async function getTextNameBiblical() {
    console.log(('getTextNameBiblical'))
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/getBiblicalTextNames`);
    if (!res.ok)
        throw new Error('File non trovato')
    return await res.json() as TextListSchema
}

export async function deleteHighlight(id: number | string) {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/deleteQuote/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok)
        throw new Error(`Errore durante l'eliminazione dell'evidenziazione`)
}

export async function settingsRetrive() {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/settings`)
    if (!res.ok)
        throw new Error(`Retrive settings error`)
    return await res.json() as SettingsType
}

export async function tooltipRetrive() {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/info/getAlgoToolpit/`)
    if (!res.ok)
        throw new Error(`Retrive algorithm information error`)
    return await res.json() as TooltipType
}

export async function researchResultRetrive(
    filename:string,
    optional?:{
        original_path:string,
        original_filename:string,
        search_start:number,
        search_end:number,
        offset:number
    }
) {
    const params = new URLSearchParams({
        filename,
        ...(optional && {
            original_path: optional.original_path,
            original_filename: optional.original_filename,
            offset: String(optional.offset),
            search_start: String(optional.search_start),
            search_end: String(optional.search_end)
        })
    })

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/getSearchJson/?${params}`)

    if (!res.ok)
        throw new Error()
    return await res.json() as SearchResultType
}

export async function researchResultExport(filename: string, opt?: {
    path_b: string
    filename_b: string
    search_start: number
    search_end: number
}) {
    const params = new URLSearchParams({
        filename,
        ...(opt && {
            path_b: opt.path_b,
            filename_b: opt.filename_b,
            search_start: String(opt.search_start),
            search_end: String(opt.search_end)
        })
    })
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/getSearchXlsx/?${params}`)

    console.log(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/getSearchXlsx/?${params}\``)

    if (!res.ok)
        throw new Error(`Errore durante l'esportazione dei risultati`)
    return await res.blob()
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

export async function getAllHighlightHistorical(filename: string, path: string) {
    const params = new URLSearchParams({
        filename,
        path
    })
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/info/getAllHighlightHistorical?${params}`)

    if (!res.ok)
        throw new Error();
    return await res.json() as highlightTextType[]
}

export async function addNewHighlight(addNewHighlightsType: NewHighlightType) {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/quote/saveQuote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addNewHighlightsType),
    })
    if (!res.ok)
        throw new Error(`Error cannot add new highlight`)
}

export async function uploadBiblicalText({path, filename, file, text}: UploadBiblicalTextType) {
    const formData = new FormData()
    formData.append('path', path)
    formData.append('filename', filename)
    if (file)
        formData.append('file', file)
    if (text !== undefined)
        formData.append('text', text)

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/upload`, {
        method: 'POST',
        body: formData,
    })

    if (!res.ok)
        throw new Error(`Errore durante il caricamento del testo`)

    return await res.json() as UploadIdType
}

export async function deleteText(id:number){
    const params = new URLSearchParams({id: String(id)})
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/deleteBiblicalText?${params}`, {
        method: 'DELETE',
    })
    if (!res.ok)
        throw new Error(`Errore durante l'eliminazione del testo`)
}
