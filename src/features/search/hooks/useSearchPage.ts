import {useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router";
import {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {Dialog} from "@base-ui/react/dialog";
import useSSESearch from "@/features/search/hooks/useSSESearch.ts";
import {SettingsType} from "@/features/search/api/searchApiType.ts";

type Props={
    settings: SettingsType,
    selectedText: TextSelectedType
    searchElement: SearchType | undefined
    isTextLoading: boolean
    resetSearchElement: () => void
}

export default function useSearchPage({settings, selectedText, searchElement,resetSearchElement}:Props) {
    const globalState = useGlobalState()
    const [searchParams] = useSearchParams()
    const setBatchedParams = useBatchedSearchParams()
    const dialogHandle = useRef(Dialog.createHandle())
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [confirmedSearch, setConfirmedSearch] = useState<SearchType | undefined>(() => {
        const cs = globalState.swapPage.state.search?.confirmedSearch

        if (cs && cs.path === selectedText.path && cs.filename === selectedText.items.filename)
            return cs
        return undefined
    })

    const [algoSelected,setAlgoSelected] = useState<string[]>(()=>{
        const paramAlgos = searchParams.get('algos')
        const refAlgos = globalState.swapPage.state.search?.algoSelected

        if (refAlgos)
            return refAlgos
        if (paramAlgos)
            return paramAlgos.split(',').filter(Boolean)
        return [
            ...Object.keys(settings.sentence_transformer_models),
            ...settings.explicit_algorithms
        ]
    })
    const [sourcesSelected,setSourcesSelected]=useState<string[]>(()=>{
        const paramSources = searchParams.get('sources')
        const refSources = globalState.swapPage.state.search?.sourcesSelected

        if (refSources)
            return refSources
        if (paramSources)
            return paramSources.split(',').filter(Boolean)
        return Object.keys(settings.sources)
    })
    const [searchQuery,setSearchQuery] = useState<string>(() => {
        const q = searchParams.get('q')
        if (q)
            return q
        const globalQ = globalState.swapPage.state.search?.searchQuery
        if (globalQ)
            return globalQ
        return ""
    })
    const {handleSearch, sseData} = useSSESearch({
        dialogHandle,
        initialResultFilename: globalState.swapPage.state.search?.resultFilename
    })

    function onSearchSubmit() {
        if (debounceTimerRef.current)
            clearTimeout(debounceTimerRef.current)

        setConfirmedSearch(searchElement)
        void handleSearch(searchQuery, sourcesSelected, algoSelected)

        const updates: Record<string, string | undefined> = {
            q: undefined,
            h: undefined,
            start: undefined,
            end: undefined,
            algos: algoSelected.length > 0 ? algoSelected.join(',') : undefined,
            sources: sourcesSelected.length > 0 ? sourcesSelected.join(',') : undefined
        }

        globalState.swapPage.searchRef.current={
            ...globalState.swapPage.searchRef.current,
            searchQuery: searchQuery,
            confirmedSearch: searchElement,
            algoSelected: algoSelected,
            sourcesSelected: sourcesSelected,
            resultFilename: sseData.resultFilename
        }

        if (searchElement) {
            updates.h = `${searchElement.path}:${searchElement.filename}`
            if (searchElement.selection) {
                updates.start = String(searchElement.selection.start)
                updates.end = String(searchElement.selection.end)
            }
        } else if (searchQuery.trim())
            updates.q = searchQuery

        setBatchedParams(updates)
    }

    useEffect(() => {
        if (confirmedSearch && (confirmedSearch.path !== selectedText.path || confirmedSearch.filename !== selectedText.items.filename)) {
            setConfirmedSearch(undefined)
            setBatchedParams({
                q: confirmedSearch.text
            })
            globalState.swapPage.searchRef.current = {
                ...globalState.swapPage.searchRef.current,
                searchQuery: confirmedSearch.text,
                confirmedSearch: undefined,
                algoSelected: globalState.swapPage.state.search?.algoSelected ?? [],
                sourcesSelected: globalState.swapPage.state.search?.sourcesSelected ?? [],
                resultFilename: globalState.swapPage.state.search?.resultFilename
            }
            resetSearchElement()
        }
    }, [selectedText])

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current)
        }
    }, [])

    useEffect(() => {
        if (searchElement != undefined) {
            setSearchQuery(searchElement.text)
        }
    }, [searchElement])

    return{
        confirmedSearch,
        algoSelected, setAlgoSelected,
        searchQuery, setSearchQuery,
        sourcesSelected, setSourcesSelected,
        onSearchSubmit,
        dialogHandle,sseData,debounceTimerRef
    }
}
