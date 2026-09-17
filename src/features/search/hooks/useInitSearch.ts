import {useEffect} from "react";
import {useLocation, useSearchParams} from "react-router";
import {type TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {type TextSchema} from "@/api/indexType.ts";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {copyHighlightText} from "@/utils/commonUtil.ts";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {type SearchType} from "@/features/editor/reducer/selectionReducer.ts";

export default function useInitSearch(
    textHistoricalSelected?: TextSelectedType,
    textHistoricalContent?: TextSchema
) {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const globalState = useGlobalState()
    const setSearchElement = useSelectionStore(state => state.setSearchElement)
    const setBatchedParams = useBatchedSearchParams()

    function initSearchElement(textHistoricalSelected: TextSelectedType, textHistoricalContent: TextSchema, targetSearch: SearchType) {
        if(targetSearch && targetSearch.selection){
            const extractedText = copyHighlightText({
                text: textHistoricalContent,
                startWordId: targetSearch.selection.start,
                endWordId: targetSearch.selection.end
            })

            setSearchElement({
                ...targetSearch,
                text: extractedText,
            })
        }

        const paramStart = searchParams.get('start')
        const paramEnd = searchParams.get('end')

        if(paramStart && paramEnd) {
            const start = Number(paramStart)
            const end = Number(paramEnd)
            const extractedText = copyHighlightText({
                text: textHistoricalContent,
                startWordId: start,
                endWordId: end
            })

            const searchObj = {
                text: extractedText,
                path: textHistoricalSelected.path,
                filename: textHistoricalSelected.items.filename,
                id: textHistoricalSelected.items.id,
                selection: {
                    start: start,
                    end: end,
                    side: "historical" as const
                }
            }

            setSearchElement(searchObj)
            globalState.setSearch({ confirmedSearch: searchObj })
        }
    }

    function createUrl({q, algo, sources, targetSearch}: {
        targetSearch: SearchType
        q?: string
        algo?: string
        sources?: string
    }){
        const newURL: Record<string, string | undefined> = {}
        const start = targetSearch?.selection?.start != null
            ? String(targetSearch.selection.start)
            : undefined
        const end = targetSearch?.selection?.end != null
            ? String(targetSearch.selection.end)
            : undefined

        if(!searchParams.has('algos') && algo)
            newURL.algos = algo
        if(!searchParams.has('sources') && sources)
            newURL.sources = sources

        if (!searchParams.has('start') && !searchParams.has('end') && !searchParams.has('q')) {
            if (start && end) {
                newURL.start = start
                newURL.end = end
            } else if (q)
                newURL.q = q
        }

        if (Object.keys(newURL).length > 0)
            setBatchedParams(newURL, '/search')
    }

    function setSearchState({q, algo, sources}: {
        q?: string
        algo?: string
        sources?: string
    }){
        if(searchParams.has('algos') && !algo){
            globalState.setSearch({ algoSelected: searchParams.get('algos')?.split(',') })
        }
        if(searchParams.has('sources') && !sources){
            globalState.setSearch({ sourcesSelected: searchParams.get('sources')?.split(',') })
        }
        if(searchParams.has('q') && !q){
            globalState.setSearch({ searchQuery: searchParams.get('q') ?? '' })
        }
    }

    function readSearchGlobalState(){
        if(globalState.state?.search ) {
            globalState.setSearch({ search: undefined })
            return globalState.state?.search?.search
        }
        return globalState.state?.search?.confirmedSearch
    }

    // Inizializzazione
    useEffect(() => {
        if(!globalState.initPage.getIsInitialMount('searchParams') || (location.pathname !== "/search" || !textHistoricalSelected || !textHistoricalContent || textHistoricalContent.length === 0)) {
            return
        }

        const targetSearch: SearchType = readSearchGlobalState()
        const searchState = globalState.state.search
        initSearchElement(textHistoricalSelected, textHistoricalContent,targetSearch)

        const q = searchState?.searchQuery
        const algo = searchState?.algoSelected?.join(',')
        const sources = searchState?.sourcesSelected?.join(',')

        createUrl({q, algo, sources, targetSearch})
        setSearchState({q, algo, sources})

        globalState.initPage.consumeInitialMount('searchParams')
    }, [])
}
