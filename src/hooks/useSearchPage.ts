import {useCallback, useEffect, useState} from "react";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import {useSearchParams} from "react-router";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {SettingsType} from "@/api";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";

type Props={
    settings: SettingsType
}

export default function useSearchPage({settings}:Props) {
    const globalState = useGlobalState()
    const [searchParams] = useSearchParams()
    const setBatchedParams = useBatchedSearchParams()

    const [confirmedSearch, privateSetConfirmedSearch] = useState<SearchType | undefined>(() => globalState.state.search?.confirmedSearch)
    const [algoSelected,privateSetAlgoSelected] = useState<string[]>(()=>{
        const paramAlgos = searchParams.get('algos')
        if (globalState.state.search?.algoSelected)
            return globalState.state.search.algoSelected
        if (paramAlgos)
            return paramAlgos.split(',').filter(Boolean)
        return [
            ...Object.keys(settings.sentence_transformer_models),
            ...settings.explicit_algorithms
        ]
    })
    const [sourcesSelected,privateSetSourcesSelected]=useState<string[]>(()=>{
        const paramSources = searchParams.get('sources')
        if (globalState.state.search?.sourcesSelected)
            return globalState.state.search.sourcesSelected
        if (paramSources)
            return paramSources.split(',').filter(Boolean)
        return Object.keys(settings.sources)
    })
    const [searchQuery, privateSetSearchQuery] = useState<string>(() => {
        const paramQ = searchParams.get('q')
        if (paramQ)
            return paramQ
        if (globalState.state.search?.searchQuery)
            return globalState.state.search.searchQuery
        return ""
    })

    const setConfirmedSearch = useCallback((confSearch: SearchType) => {
        // Per evitare di modificare i parametri della query legata a un determinato filename
        globalState.searchRef.current.confirmedSearch = confSearch
        privateSetConfirmedSearch(confSearch)
    }, [globalState.searchRef])

    const setSearchQuery = useCallback((query: string) => {
        //console.log('actualizando searchQuery', query)
        globalState.searchRef.current.searchQuery = query
        //setBatchedParams({q: query})

        privateSetSearchQuery(query)
    }, [globalState.searchRef])

    const setAlgoSelected = useCallback((algos: string[]) => {
        globalState.searchRef.current.algoSelected = algos
        privateSetAlgoSelected(algos)

        setBatchedParams({
            algos: algos.length > 0 ? algos.join(',') : undefined
        }, '/search', 'useSearchPage')
    }, [setBatchedParams, globalState.searchRef])

    const setSourcesSelected = useCallback((source: string[]) => {
        globalState.searchRef.current.sourcesSelected = source
        privateSetSourcesSelected(source)

        setBatchedParams({
            sources: source.length > 0 ? source.join(',') : undefined
        }, '/search', 'useSearchPage')
    }, [setBatchedParams, globalState.searchRef])

    useEffect(() => {
        globalState.searchRef.current.algoSelected = algoSelected
        globalState.searchRef.current.sourcesSelected = sourcesSelected
        if (searchQuery) {
            globalState.searchRef.current.searchQuery = searchQuery
        }
        if (confirmedSearch) {
            globalState.searchRef.current.confirmedSearch = confirmedSearch
        }
    }, [algoSelected, sourcesSelected, searchQuery, confirmedSearch, globalState.searchRef])

    useEffect(() => {
        const searchState = globalState.state.search
        const newURL: Record<string, string | undefined> = {}

        if(!searchParams.has('algos')) {
            newURL.algos = algoSelected.join(',')
        }
        if(!searchParams.has('sources')) {
            newURL.sources = sourcesSelected.join(',')
        }

        const targetSearch = searchState?.searchElement ?? searchState?.confirmedSearch
        const start = targetSearch?.selection?.start != null ? String(targetSearch.selection.start) : undefined
        const end = targetSearch?.selection?.end != null ? String(targetSearch.selection.end) : undefined
        const q = searchState?.searchQuery

        if (!searchParams.has('start') && !searchParams.has('end') && !searchParams.has('q')) {
            if (start && end) {
                newURL.start = start
                newURL.end = end
            } else if (q) {
                newURL.q = q
            }
        }

        if (Object.keys(newURL).length > 0) {
            setBatchedParams(newURL, '/search', 'useSearchPage')
        }
    }, [])

    /*
    useEffect(() => {


        const needsSync = !hasAlgos || !hasSources ||
            (hasConfirmedSelection && (!hasStart || !hasB)) ||
            (hasTextQuery && !hasQ)

        /*
        if (needsSync) {
            const updates: Record<string, string | undefined> = {}

            if (!hasAlgos && algoSelected.length > 0) {
                updates.algos = algoSelected.join(',')
            }
            if (!hasSources && sourcesSelected.length > 0) {
                updates.sources = sourcesSelected.join(',')
            }

            if (searchState?.confirmedSearch) {
                if (!hasB && searchState.confirmedSearch.path && searchState.confirmedSearch.filename) {
                    updates.b = `${searchState.confirmedSearch.path}:${searchState.confirmedSearch.filename}`
                }
                if (!hasStart && searchState.confirmedSearch.selection) {
                    updates.start = String(searchState.confirmedSearch.selection.start)
                    updates.end = String(searchState.confirmedSearch.selection.end)
                }
            } else if (searchState?.searchQuery && !hasQ) {
                updates.q = searchState.searchQuery
            }

            if (Object.keys(updates).length > 0) {
                setBatchedParams(updates)
            }
        }

    }, [])

     */

    return{
        confirmedSearch, setConfirmedSearch,
        algoSelected, setAlgoSelected,
        searchQuery, setSearchQuery,
        sourcesSelected, setSourcesSelected
    }
}
