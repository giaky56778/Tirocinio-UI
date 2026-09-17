import {type UrlPath} from "@/features/editor/lib/utils.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import {READ_QUERY_DEFAULTS} from "@/utils/settings.ts";
import {useStaticBiblicalTextRead} from "@/features/editor/hooks/useTextRead.ts";
import {readHighlightPortion} from "@/features/editor/api/editorApi.ts";

export function useStaticTextRead({idHistorical, historicalLine, urlBiblical}: {
    idHistorical: number
    historicalLine: number
    urlBiblical: UrlPath
}) {
    const {id:idBiblical,text:biblicalTextQuery} = useStaticBiblicalTextRead(urlBiblical)

    const highlightWordsQuery = useSuspenseQuery({
        queryKey: ['highlightWords', idBiblical, idHistorical],
        queryFn: () => readHighlightPortion(
            idBiblical!,
            idHistorical,
            historicalLine,
            urlBiblical.scrollLine,
        ),
        ...READ_QUERY_DEFAULTS,
        gcTime: 0,
        staleTime: 0,
    })

    return {
        idBiblical,
        biblicalTextQuery,
        highlightWordsQuery: {
            data: highlightWordsQuery.data,
            isLoading: highlightWordsQuery.isLoading,
            isFetching: highlightWordsQuery.isFetching
        }
    }
}


