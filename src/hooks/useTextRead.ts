import {
    getTextNameBiblical,
    getTextNameHistorical,
    readBiblicalText,
    readHistoricalText,
    readHighlight, TextQuery, readHighlightPortion, readBiblicalTextPortion, readHistoricalTextPortion,
    getAllHighlightHistorical,
} from "@/api";
import {useQueries, useQuery, useSuspenseQueries, useSuspenseQuery} from "@tanstack/react-query";
import {UrlPath} from "@/components/page/editorPage.tsx";
import {TextBundle, TextListSchema} from "@/utils/JSONSchema.ts";
import {READ_QUERY_DEFAULTS, Side} from "@/utils/globalType.ts";
import {PageType} from "@/contexts/globalState.tsx";
import useTextNameSelection, {TextSelectedType} from "@/hooks/useTextNameSelection.ts";

type TextReadConfig = {
    namesQueryKey: string
    getNames: () => Promise<TextListSchema>
    readText: ({id, path, filename}: TextQuery) => Promise<TextBundle>
    initialSelected?: TextSelectedType
    initUrl?:UrlPath
    page: PageType
    side: Side
}

/**
 * Hook generico per la lettura di testi (biblico o storico).
 * Fa il fetching dei nomi e delega a useTextNameSelection la gestione della selezione.
 */
export function useTextReadBase({ namesQueryKey, getNames, readText, side, page}: TextReadConfig) {
    const namesQuery = useSuspenseQuery({
        queryKey: [namesQueryKey],
        queryFn: getNames,
        ...READ_QUERY_DEFAULTS,
        staleTime: Infinity,
        gcTime: Infinity
    })

    const {selected, setSelected, selectedItem} = useTextNameSelection({namesQuery: namesQuery, side, page})

    const textQuery = useQuery({
        queryKey: [namesQueryKey, 'content', selectedItem?.id ?? 0],
        queryFn: () => readText({id:selectedItem!.id}),
        throwOnError: true,
        enabled:selected!=undefined,
        ...READ_QUERY_DEFAULTS,
        gcTime: Infinity,
        staleTime: Infinity
    })

    return {
        names:namesQuery.data,
        selected,
        setSelected,
        selectedItem,
        namesQuery,
        textQuery
    }
}

/**
 * Hook per la lettura del testo biblico
 */
export function useBiblicalTextRead(page:PageType) {

    const result = useTextReadBase({
        namesQueryKey: 'biblicalText',
        getNames: getTextNameBiblical,
        readText: readBiblicalText,
        side: 'biblical',
        page:page
    })

    return {
        isLoading: result.namesQuery.isLoading || result.textQuery.isLoading,
        textName: result.selectedItem,
        biblicalNamesQuery: result.namesQuery,
        biblicalNames: result.names,
        selectedText: result.selected,
        setSelectedText: result.setSelected,
        textQuery: result.textQuery
    }
}

/**
 * Hook principale che combina biblico e storico e carica gli highlights.
 *
 * A differenza di useBiblicalTextRead/useHistoricalTextRead (usati anche altrove
 * con useQuery classico), qui le 2 liste nomi vengono caricate con useSuspenseQueries:
 * nessuna delle richieste aspetta le altre, quindi non c'è caricamento a stadi.
 * La selezione (inclusa l'auto-guarigione) è comunque delegata a useTextNameSelection,
 * la cui risoluzione iniziale è sincrona e quindi compatibile con dati già pronti da Suspense.
 */
export function useHighlightRead() {
    const [biblicalNamesQuery, historicalNamesQuery] = useSuspenseQueries({
        queries: [
            {
                queryKey: ['biblicalText'],
                queryFn: getTextNameBiblical,
                ...READ_QUERY_DEFAULTS,
                staleTime: Infinity,
                gcTime: Infinity
            }, {
                queryKey: ['historicalText'],
                queryFn: getTextNameHistorical,
                ...READ_QUERY_DEFAULTS,
                staleTime: Infinity,
                gcTime: Infinity
            }
        ]
    })

    const biblicalSelection = useTextNameSelection({
        namesQuery: biblicalNamesQuery,
        side: 'biblical',
        page:'editor'
    })
    const historicalSelection = useTextNameSelection({
        namesQuery: historicalNamesQuery,
        side: 'historical',
        page:'editor'
    })

    const bibTextId = biblicalSelection.selected?.items.id
    const histTextId = historicalSelection.selected?.items.id

    const [historicalTextQuery, biblicalTextQuery, highlightWordsQuery] = useQueries({
        queries: [{
            queryKey: ['historicalText', 'content', histTextId??0],
            queryFn: () => readHistoricalText({id: histTextId}),
            throwOnError: true,
            enabled: histTextId != null,
            ...READ_QUERY_DEFAULTS,
            gcTime: Infinity,
            staleTime: Infinity
        }, {
            queryKey: ['biblicalText', 'content', bibTextId??0],
            queryFn: () => readBiblicalText({id: bibTextId}),
            enabled: bibTextId != null,
            throwOnError: true,
            ...READ_QUERY_DEFAULTS,
            gcTime: Infinity,
            staleTime: Infinity
        }, {
            queryKey: ['highlightWords', histTextId, bibTextId??0],
            queryFn: () => readHighlight(histTextId!, bibTextId!),
            enabled: bibTextId != null && histTextId != null,
            throwOnError: true,
            ...READ_QUERY_DEFAULTS,
            gcTime: 0,
            staleTime: 0
        }]
    })

    return {
        isLoading: biblicalNamesQuery.isLoading || historicalNamesQuery.isLoading || historicalTextQuery.isLoading || biblicalTextQuery.isLoading || highlightWordsQuery.isLoading,
        highlightWords: highlightWordsQuery,
        biblical: {
            selectedText: biblicalSelection.selected,
            setSelectedText: biblicalSelection.setSelected,
            textBundle: biblicalTextQuery,
            textList: biblicalNamesQuery
        },
        historical: {
            selectedText: historicalSelection.selected,
            setSelectedText: historicalSelection.setSelected,
            textBundle: historicalTextQuery,
            textList: historicalNamesQuery
        },
    }
}

export function useStaticHistoricalTextRead(urlHistorical:UrlPath,lineRange?:string, start?:number){

    const historicalTextQuery = useSuspenseQuery({
        queryKey: ['historicalText', 'static', urlHistorical.filename, urlHistorical.path, lineRange ?? urlHistorical.scrollLine],
        queryFn: () => lineRange != undefined
            ? readHistoricalTextPortion({filename:urlHistorical.filename,path:urlHistorical.path, lineNumber:lineRange})
            : start !== undefined
                ? readHistoricalTextPortion({filename:urlHistorical.filename,path:urlHistorical.path, wordId:start})
                : readHistoricalTextPortion({filename:urlHistorical.filename,path:urlHistorical.path, line:urlHistorical.scrollLine}),
        ...READ_QUERY_DEFAULTS,
        staleTime: Infinity,
        gcTime: Infinity,
    })

    return {
        text: historicalTextQuery,
        id: historicalTextQuery.data.textId
    }
}

export function useStaticBiblicalTextRead(urlBiblical: UrlPath, lineRange?: string, start?: number){
    const biblicalTextQuery = useSuspenseQuery({
        queryKey: ['biblicalText', 'static', urlBiblical.filename, urlBiblical.path, lineRange ?? urlBiblical.scrollLine],
        queryFn: () => lineRange != undefined
            ? readBiblicalTextPortion({filename:urlBiblical.filename,path:urlBiblical.path, lineNumber:lineRange})
            : start !== undefined
                ? readBiblicalTextPortion({filename:urlBiblical.filename,path:urlBiblical.path, wordId:start})
                : readBiblicalTextPortion({filename:urlBiblical.filename,path:urlBiblical.path, line:urlBiblical.scrollLine}),
        ...READ_QUERY_DEFAULTS,
        staleTime: Infinity,
        gcTime: Infinity,
    })

    return {
        text: biblicalTextQuery,
        id: biblicalTextQuery.data.textId
    }
}

export function useStaticTextRead({idBiblical, biblicalLine, urlHistorical}: {
    idBiblical: number
    biblicalLine: number
    urlHistorical: UrlPath
}) {
    console.log(urlHistorical)
    const {id:idHistorical,text:historicalTextQuery} = useStaticHistoricalTextRead(urlHistorical)

    const highlightWordsQuery = useSuspenseQuery({
        queryKey: ['highlightWords', idHistorical, idBiblical],
        queryFn: () => readHighlightPortion(
            idHistorical!,
            idBiblical,
            biblicalLine,
            urlHistorical.scrollLine,
        ),
        ...READ_QUERY_DEFAULTS,
        gcTime: 0,
        staleTime: 0,
    })

    return {
        idHistorical,
        historicalTextQuery,
        highlightWordsQuery
    }
}

export function useVisualizeAllHighlight(){
    const namesQuery = useSuspenseQuery({
        queryKey: ['biblicalTextVisualize'],
        queryFn: getTextNameBiblical,
        ...READ_QUERY_DEFAULTS,
    })
    const {selected, setSelected} = useTextNameSelection({side: 'biblical', namesQuery: namesQuery, page:'view'})

    const [highlightsTextQuery,historicalNamesQuery] = useQueries({
        queries:[{
            queryKey: ['biblicalTextVisualize', 'content', selected?.items.id],
            enabled: selected?.items.id != null,
            queryFn: () => getAllHighlightHistorical(
                selected!.items.filename,
                selected!.path,
            )
        },{
            queryKey: ['historicalText'],
            queryFn: getTextNameHistorical,
            ...READ_QUERY_DEFAULTS
        }]
    })

    return {
        isLoading: namesQuery.isLoading || highlightsTextQuery.isLoading || historicalNamesQuery.isLoading,
        namesQuery,
        selected,
        setSelected,
        highlightsTextQuery,
        historicalNamesQuery
    }
}
