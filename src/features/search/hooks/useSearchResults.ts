import {useMemo, useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";
import {type SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {OFFSET_LIMIT, READ_QUERY_DEFAULTS} from "@/utils/settings.ts";
import {useAddNewHighlightWords} from "@/features/search/hooks/useApiSearch.ts";
import {researchResultRetrive, searchXlsxExport} from "@/features/search/api/searchApi.ts";
import {type SingleSearchType} from "@/features/search/api/searchApiType.ts";

export type SearchResultQueryType = {
    hasNextPage: boolean
    isFetching: boolean
    onLoadMore: () => void
}

type Props = {
    filename: {
        filename: string
        total_size: number
    },
    confirmedSearch?: SearchType
}

export default function useSearchResults({ filename, confirmedSearch }: Props) {

    const searchQueryKey = [filename.filename, 'json', confirmedSearch]

    const [filterState, setFilterState] = useState<{ key: string; value: boolean }>({key: "", value: true})
    const addNewHighlightMutation = useAddNewHighlightWords({searchQueryKey})
    const hasSearch = useMemo(() => filename.filename !== '', [filename.filename])

    const isDoubleMode = confirmedSearch != undefined
    const confirmedSearchKey = confirmedSearch
        ? `${confirmedSearch.path ?? ""}|${confirmedSearch.filename ?? ""}|${confirmedSearch.selection?.start ?? ""}|${confirmedSearch.selection?.end ?? ""}`
        : ""
    const filterValid = !!confirmedSearch && (filterState.key === confirmedSearchKey ? filterState.value : true)

    const searchResultQuery = useInfiniteQuery({
        queryKey: searchQueryKey,
        queryFn: ({pageParam}) =>
            isDoubleMode
                ? researchResultRetrive(filename.filename, {
                    original_path: confirmedSearch!.path!,
                    original_filename: confirmedSearch!.filename!,
                    search_start: confirmedSearch!.selection!.start!,
                    search_end: confirmedSearch!.selection!.end,
                    offset: pageParam
                })
                : researchResultRetrive(filename.filename),
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            if (!isDoubleMode || lastPage.results.length < OFFSET_LIMIT)
                return undefined
            return lastPageParam + 1
        },
        enabled: filename.filename !== "" && filename.total_size !== 0,
        ...READ_QUERY_DEFAULTS,
        gcTime: 0,
        staleTime: 0
    })

    const accumulatedResults: SingleSearchType[] = useMemo(
        () => (searchResultQuery.data?.pages.flatMap((page) => page.results) ?? []),
        [searchResultQuery.data?.pages]
    )

    const displayedResults = useMemo(() => {
        const indexed = accumulatedResults.map((item, i) => ({
            item,
            originalIndex: i
        }))

        if(filterValid)
            return indexed.filter(({item}) => item.range?.error === 0)
        return indexed
    }, [accumulatedResults, filterValid])

    async function exportResults() {
        const opt = (confirmedSearch?.path && confirmedSearch?.filename && confirmedSearch?.selection)
            ? {
                path_b: confirmedSearch?.path,
                filename_b: confirmedSearch?.filename,
                search_start: confirmedSearch?.selection?.start,
                search_end: confirmedSearch?.selection?.end
            }
            : undefined
        const blob = await searchXlsxExport(filename.filename, opt)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename.filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const returnSearchResult:SearchResultQueryType={
        hasNextPage: searchResultQuery.hasNextPage,
        isFetching: searchResultQuery.isFetching,
        onLoadMore: () => {
            if (searchResultQuery.hasNextPage)
                void searchResultQuery.fetchNextPage()
        }
    }

    return {
        hasSearch,
        isDoubleMode,
        filterValid,
        setFilterState,
        searchResultQuery:returnSearchResult,
        confirmedSearchKey,
        displayedResults,
        exportResults,
        addNewHighlight: addNewHighlightMutation,
        accumulatedResultsLength: accumulatedResults.length,
        lineHistorical: searchResultQuery.data?.pages[0]?.lineIndex ?? -1
    }
}
