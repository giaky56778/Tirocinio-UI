import {type PageType} from "@/store/globalStateStore.ts";
import {getTextNameHistorical, readHistoricalText} from "@/api";
import {useTextReadBase} from "@/features/editor/hooks/useTextRead.ts";

export function useHistoricalTextRead(page:PageType) {

    const result = useTextReadBase({
        namesQueryKey: 'historicalText',
        getNames: getTextNameHistorical,
        readText: readHistoricalText,
        side: 'historical',
        page:page
    })

    return {
        isLoading: result.namesQuery.isLoading || result.textQuery.isLoading,
        textName: result.selected?.items,
        historicalNamesQuery: result.namesQuery,
        historicalNames: result.names,
        selectedText: result.selected,
        setSelectedText: result.setSelected,
        deleteText: result.deleteText,
        textQuery: result.textQuery
    }
}
