export type SearchResultRange={
    startWordId: number
    endWordId: number
    startLine: number
    endLine: number
    error: -1|0|1
}

export type SearchResultText={
    found: string
    confidency: number
    algos: string[]
    source: string
    urn: string
    query: string
    method: string
    sources: string
    idBiblical: number
}

export type NewHighlightType={
    urn_b: string
    start_b: number
    end_b: number
    line_start_b: number

    h_id_text: number
    start_h: number
    end_h: number
}

export type SingleSearchType = {
    text: SearchResultText
    query?:string
    range?: SearchResultRange
}

export type SearchResultType ={
    results:SingleSearchType[]
    lineIndex?:number
}

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

export type ForToastType={
    b_path: string,
    b_filename: string,
    b_id: number,

    h_path: string,
    h_filename: string,
    line_start_h: number
}
