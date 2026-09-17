import {useMutation, useQueryClient, useSuspenseQueries} from "@tanstack/react-query";
import {READ_QUERY_DEFAULTS} from "@/utils/settings.ts";
import {addNewHighlight, settingsRetrive, tooltipRetrive} from "@/features/search/api/searchApi.ts";
import {type SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import toast from "react-hot-toast";
import ToastViewHighlightAdd from "@/features/search/components/search/toastViewHighlightAdd.tsx";
import {createElement} from "react";
import {type ForToastType, type NewHighlightType} from "@/features/search/api/searchApiType.ts";

export type AddNewHighlightQueryType = {
    add: (data: AddType) => void
    isPending: boolean
}

export type AddType ={
    newHighlight: NewHighlightType
    forToast: ForToastType
}

export function useReadSettingsSearch(){
    const [settings, tooltip] =useSuspenseQueries({
        queries: [
            {
                queryKey: ['settings'],
                queryFn: () => settingsRetrive(),
                ...READ_QUERY_DEFAULTS
            },
            {
                queryKey: ['tooltip'],
                queryFn: () => tooltipRetrive(),
                ...READ_QUERY_DEFAULTS
            }
        ]
    })
    return{
        isLoading:settings.isLoading || tooltip.isLoading,
        settingsQuery:settings,
        tooltipQuery:tooltip
    }
}

export function useAddNewHighlightWords({searchQueryKey}:{
    searchQueryKey:  (string | SearchType)[],
}):AddNewHighlightQueryType {
    const queryClient = useQueryClient()
    const addNewQuote = useMutation({
        mutationFn: (newHighlight: AddType) => addNewHighlight(newHighlight.newHighlight),
        async onSuccess(_, value) {
            await queryClient.invalidateQueries({queryKey: searchQueryKey, exact: true})

            toast.custom(
                (t) => createElement(ToastViewHighlightAdd, { toastParam: t, value }),
                {
                    id: "toastViewHighlightAdd",
                    duration: 5000
                }
            )
        },
        onError(error) {
            toast.error(error.message)
        }
    })

    return {
        add: (newHighlight: AddType) => addNewQuote.mutate(newHighlight),
        isPending: addNewQuote.isPending
    }
}
