import {NewHighlightType, SearchResultType, SettingsType, TooltipType} from "@/features/search/api/searchApiType.ts";

export async function settingsRetrive() {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/settings`)
    if (!res.ok)
        throw new Error(`Errore lettura dei settings`)
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

export async function searchXlsxExport(filename: string, opt?: {
    path_b: string
    filename_b: string
    search_start: number
    search_end: number
}) {
    const params = new URLSearchParams({
        filename,
        ...(opt && {
            path_h: opt.path_b,
            filename_h: opt.filename_b,
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
