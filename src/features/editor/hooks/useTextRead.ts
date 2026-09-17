import {type TextQuery} from "@/api";
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {READ_QUERY_DEFAULTS, type TextType} from "@/utils/settings.ts";
import useTextNameSelection, {type TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {type TextBundle, type TextListSchema} from "@/api/indexType.ts";
import {type PageType} from "@/contexts/globalState.tsx";
import {type UrlPath} from "@/features/editor/lib/utils.ts";
import {readBiblicalTextPortion, readHistoricalTextPortion} from "@/features/editor/api/editorApi.ts";

type TextReadConfig = {
    namesQueryKey: string
    getNames: () => Promise<TextListSchema>
    readText: ({id, path, filename}: TextQuery) => Promise<TextBundle>
    initialSelected?: TextSelectedType
    initUrl?:UrlPath
    page: PageType
    side: TextType
}

export function useTextReadBase({ namesQueryKey, getNames, readText, side, page}: TextReadConfig) {
    const namesQuery = useSuspenseQuery({
        queryKey: [namesQueryKey],
        queryFn: getNames,
        ...READ_QUERY_DEFAULTS,
        staleTime: Infinity,
        gcTime: Infinity
    })

    const {selected, setSelected, deleteText} = useTextNameSelection({names: namesQuery.data ?? [], side, page})

    const textQuery = useQuery({
        queryKey: [namesQueryKey, 'content', selected?.items.id ?? 0],
        queryFn: () => readText({id:selected?.items.id}),
        throwOnError: true,
        enabled:selected!=undefined,
        ...READ_QUERY_DEFAULTS,
        gcTime: Infinity,
        staleTime: Infinity
    })

    return {
        names: namesQuery.data,
        selected,
        setSelected,
        namesQuery: {
            data: namesQuery.data,
            isLoading: namesQuery.isLoading,
            isFetching: namesQuery.isFetching
        },
        deleteText,
        textQuery: {
            data: textQuery.data,
            isLoading: textQuery.isLoading,
            isFetching: textQuery.isFetching
        }
    }
}

export function useStaticBiblicalTextRead(urlBiblical:UrlPath,lineRange?:string, start?:number){

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
        text: {
            data: biblicalTextQuery.data,
            isLoading: biblicalTextQuery.isLoading,
            isFetching: biblicalTextQuery.isFetching
        },
        id: biblicalTextQuery.data.textId
    }
}

export function useStaticHistoricalTextRead(urlHistorical: UrlPath, lineRange?: string, start?: number){
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
        text: {
            data: historicalTextQuery.data,
            isLoading: historicalTextQuery.isLoading,
            isFetching: historicalTextQuery.isFetching
        },
        id: historicalTextQuery.data.textId
    }
}
