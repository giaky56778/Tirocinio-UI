import {useQueries, useSuspenseQueries} from "@tanstack/react-query";
import {getTextNameBiblical, getTextNameHistorical, readBiblicalText, readHistoricalText} from "@/api";
import {READ_QUERY_DEFAULTS} from "@/utils/settings.ts";
import useTextNameSelection from "@/hook/useTextNameSelection.ts";
import {readHighlight} from "@/features/double-editor/api/doubleEditorApi.ts";

export function useHighlightRead() {
    const [historicalNamesQuery, biblicalNamesQuery] = useSuspenseQueries({
        queries: [
            {
                queryKey: ['historicalText'],
                queryFn: getTextNameHistorical,
                ...READ_QUERY_DEFAULTS,
                staleTime: Infinity,
                gcTime: Infinity
            }, {
                queryKey: ['biblicalText'],
                queryFn: getTextNameBiblical,
                ...READ_QUERY_DEFAULTS,
                staleTime: Infinity,
                gcTime: Infinity
            }
        ]
    })

    const historicalSelection = useTextNameSelection({
        names: historicalNamesQuery.data ?? [],
        side: 'historical',
        page:'editor'
    })
    const biblicalSelection = useTextNameSelection({
        names: biblicalNamesQuery.data ?? [],
        side: 'biblical',
        page:'editor'
    })

    const bibTextId = historicalSelection.selected?.items.id
    const histTextId = biblicalSelection.selected?.items.id

    const [biblicalTextQuery, historicalTextQuery, highlightWordsQuery] = useQueries({
        queries: [{
            queryKey: ['biblicalText', 'content', histTextId??0],
            queryFn: () => readBiblicalText({id: histTextId}),
            throwOnError: true,
            enabled: histTextId != null,
            ...READ_QUERY_DEFAULTS,
            gcTime: Infinity,
            staleTime: Infinity
        }, {
            queryKey: ['historicalText', 'content', bibTextId??0],
            queryFn: () => readHistoricalText({id: bibTextId}),
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
        isLoading: historicalNamesQuery.isLoading || biblicalNamesQuery.isLoading || biblicalTextQuery.isLoading || historicalTextQuery.isLoading || highlightWordsQuery.isLoading,
        highlightWords: highlightWordsQuery,
        historical: {
            selectedText: historicalSelection.selected,
            setSelectedText: historicalSelection.setSelected,
            deleteText: historicalSelection.deleteText,
            textBundle: historicalTextQuery,
            textList: historicalNamesQuery
        },
        biblical: {
            selectedText: biblicalSelection.selected,
            setSelectedText: biblicalSelection.setSelected,
            deleteText: biblicalSelection.deleteText,
            textBundle: biblicalTextQuery,
            textList: biblicalNamesQuery
        },
    }
}