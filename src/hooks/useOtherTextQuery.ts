import {
    InfiniteData,
    UseInfiniteQueryResult,
    useMutation,
    useQueryClient,
    useSuspenseQueries
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    addNewHighlight,
    AddNewHighlightsType,
    changeHighlight,
    deleteHighlight,
    deleteText, SearchResultType,
    settingsRetrive,
    tooltipRetrive
} from "@/api";
import {READ_QUERY_DEFAULTS} from "@/utils/globalType.ts";
import {SingleHighlightSchema} from "@/utils/JSONSchema.ts";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import ToastViewHighlightAdd from "@/components/search/toastViewHighlightAdd.tsx";
import React from "react";

export function useDeleteHighlightWords() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string|number) => deleteHighlight(id),
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ["highlightWords"] })
            toast.success("Evidenziazione cancellata con successo")
        },
        async onError() {
            toast.error("Errore durante la cancellazione dell'evidenziazione")
        }
    })
}

export function useUpdateHighlightWords() {
    return useMutation({
        mutationFn: ({id, newHighlight}: {id: number|string, newHighlight: SingleHighlightSchema}) => changeHighlight(id, newHighlight),
        async onSuccess() {
            toast.success("Evidenziazione aggiornata con successo")
        },
        async onError() {
            toast.error("Errore durante l'aggiornamento dell'evidenziazione")
        }
    })
}

export function useDeleteBiblicalText(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id}: {id: number}) => deleteText(id),
        async onSuccess() {
            await queryClient.invalidateQueries({queryKey: ["biblicalText"]})
            toast.success("Testo cancellato con successo")
        },
        async onError() {
            toast.error("Errore durante la cancellazione del testo")
        }
    })
}

export function useAddNewHighlightWords({searchQueryKey, searchResultQuery}:{
    searchQueryKey:  (string | SearchType)[],
    searchResultQuery: UseInfiniteQueryResult<InfiniteData<SearchResultType, unknown>, Error>
}) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (newHighlight: AddNewHighlightsType) => addNewHighlight(newHighlight.newHighlight),
        async onSuccess(_, value) {
            await queryClient.invalidateQueries({queryKey: searchQueryKey, exact: true})
            await searchResultQuery.refetch()

            toast.custom(
                (t) => React.createElement(ToastViewHighlightAdd, { toastParam: t, value }),
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
