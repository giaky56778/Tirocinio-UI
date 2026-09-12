import {useQueries, useSuspenseQuery} from "@tanstack/react-query";
import {getTextNameBiblical, getTextNameHistorical} from "@/api";
import {READ_QUERY_DEFAULTS} from "@/utils/settings.ts";
import useTextNameSelection from "@/hook/useTextNameSelection.ts";
import {getAllHighlightBiblical} from "@/features/view/api/viewApi.ts";

export function useVisualizeAllHighlight(){
    const namesQuery = useSuspenseQuery({
        queryKey: ['historicalText'],
        queryFn: getTextNameHistorical,
        ...READ_QUERY_DEFAULTS,
    })
    const {selected, setSelected,deleteText} = useTextNameSelection({side: 'historical', names: namesQuery.data ?? [], page:'view'})

    const [highlightsTextQuery,biblicalNamesQuery] = useQueries({
        queries:[{
            queryKey: ['historicalTextVisualize', 'content', selected?.items.id],
            enabled: selected?.items.id != null,
            queryFn: () => getAllHighlightBiblical(
                selected!.items.filename,
                selected!.path,
            )
        },{
            queryKey: ['biblicalText'],
            queryFn: getTextNameBiblical,
            ...READ_QUERY_DEFAULTS
        }]
    })

    return {
        isLoading: namesQuery.isLoading || highlightsTextQuery.isLoading || biblicalNamesQuery.isLoading,
        namesQuery: {
            data: namesQuery.data,
            isLoading: namesQuery.isLoading,
            isFetching: namesQuery.isFetching
        },
        selected,
        opText:{
            setSelected,
            deleteText
        },
        highlightsTextQuery: {
            data: highlightsTextQuery.data,
            isLoading: highlightsTextQuery.isLoading,
            isFetching: highlightsTextQuery.isFetching
        },
        biblicalNamesQuery: {
            data: biblicalNamesQuery.data,
            isLoading: biblicalNamesQuery.isLoading,
            isFetching: biblicalNamesQuery.isFetching
        }
    }
}
