export type TextType = 'historical' | 'biblical'

export const colorMap: Record<string, { class: string; fill: string;preview:string }> = {
    1: { class: 'bg-yellow-200', fill: 'fill-yellow-200',preview:'bg-yellow-50' },
    2: { class: 'bg-green-200',  fill: 'fill-green-200' ,preview:'bg-green-50' },
    3: { class: 'bg-sky-200',    fill: 'fill-sky-200'   ,preview:'bg-sky-50' },
    4: { class: 'bg-pink-200',   fill: 'fill-pink-200'  ,preview:'bg-pink-50'},
    5: { class: 'bg-purple-200', fill: 'fill-purple-200',preview:'bg-purple-50'}
}

export const TEXT_FONT_CLASS = `font-${import.meta.env.VITE_TEXT_LANGUAGE}`

export const LIMIT_PREVIEW_WORD = 20
export const LINE_EXTRACT_UPPER = 20
export const LINE_EXTRACT_LOWER = 3

export const OFFSET_LIMIT = 25
export const OFFSET_SCROLL = 4
export const WORD_PROXIMITY_PX = 20

export const READ_QUERY_DEFAULTS = {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false
}
