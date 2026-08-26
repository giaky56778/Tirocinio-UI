import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { researchResultExport, researchResultRetrive, SingleSearchType } from "@/api";
import { SearchType } from "@/components/reducer/selectionReducer.ts";
import { OFFSET_LIMIT, READ_QUERY_DEFAULTS } from "@/utils/globalType.ts";
import { useAddNewHighlightWords } from "@/hooks/useOtherTextQuery.ts";

type UseSearchResultsProps = {
    filename: {
        filename: string
        total_size: number
    },
    confirmedSearch?: SearchType,
}

export default function useSearchResults({ filename, confirmedSearch }: UseSearchResultsProps) {

    const [filterState, setFilterState] = useState<{ key: string; value: boolean }>({key: "", value: true})

    const isDoubleMode = confirmedSearch != undefined
    const hasSearch = filename.filename !== ''
    const confirmedSearchKey = confirmedSearch
        ? `${confirmedSearch.path ?? ""}|${confirmedSearch.filename ?? ""}|${confirmedSearch.selection?.start ?? ""}|${confirmedSearch.selection?.end ?? ""}`
        : ""
    const filterValid = !!confirmedSearch && (filterState.key === confirmedSearchKey ? filterState.value : true)
    
    const searchQueryKey = [filename.filename, 'json', confirmedSearch]

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

    const accumulatedResults = useMemo(
        () => (searchResultQuery.data?.pages.flatMap((page) => page.results) ?? []) as SingleSearchType[],
        [searchResultQuery.data?.pages]
    )

    const displayedResults = useMemo(() => {
        const indexed = accumulatedResults.map((item, i) => ({item, originalIndex: i}))

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
        const blob = await researchResultExport(filename.filename, opt)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename.filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    const addNewHighlightMutation = useAddNewHighlightWords({searchQueryKey, searchResultQuery})

    return {
        hasSearch,
        isDoubleMode,
        filterValid,
        setFilterState,
        confirmedSearchKey,
        searchResultQuery,
        displayedResults,
        exportResults,
        addNewHighlightMutation,
        accumulatedResultsLength: accumulatedResults.length,
        lineBiblical: searchResultQuery.data?.pages[0]?.lineIndex ?? -1
    }
}
