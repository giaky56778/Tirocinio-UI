import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {changeHighlight, deleteHighlight, SingleHighlightSchema} from "@/features/double-editor/api/doubleEditorApi.ts";

export function useDeleteHighlightWords() {
    const queryClient = useQueryClient()
    const delHigh = useMutation({
        mutationFn: (id: string|number) => deleteHighlight(id),
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ["highlightWords"] })
            toast.success("Evidenziazione cancellata con successo")
        },
        async onError() {
            toast.error("Errore durante la cancellazione dell'evidenziazione")
        }
    })

    return {
        mutate: (id: string|number) => delHigh.mutate(id)
    }
}

type UpdateMutateType={
    id: number|string,
    newHighlight: SingleHighlightSchema
}

export function useUpdateHighlightWords() {

    const update = useMutation({
        mutationFn: ({id, newHighlight}: UpdateMutateType) => changeHighlight(id, newHighlight),
        async onSuccess() {
            toast.success("Evidenziazione aggiornata con successo")
        },
        async onError() {
            toast.error("Errore durante l'aggiornamento dell'evidenziazione")
        }
    })

    return {
        mutate:({id, newHighlight}: UpdateMutateType) => update.mutate({id, newHighlight})
    }
}
