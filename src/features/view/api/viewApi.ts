import {RangeHighlight, TextSchema} from "@/api/indexType.ts";

export type highlightBiblicalType = {
    color_id:string
    historical_text:TextSchema
    biblical_text:TextSchema
    historical_start_line: number
    historical_range_word:RangeHighlight
    biblical_start_line: number
    biblical_range_word:RangeHighlight
    historical_more_line: boolean
    biblical_more_line: boolean
}

export type highlightTextType={
    filename:string,
    path:string,
    highlights:highlightBiblicalType[]
}

export async function getAllHighlightBiblical(filename: string, path: string) {
    const params = new URLSearchParams({
        filename,
        path
    })
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/info/getAllHighlightBiblical?${params}`)

    if (!res.ok)
        throw new Error()
    return await res.json() as highlightTextType[]
}
