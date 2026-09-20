import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {changeHighlight, deleteHighlight, type SingleHighlightSchema} from "@/features/double-editor/api/doubleEditorApi.ts";

export function useDeleteHighlightWords() {
    const queryClient = useQueryClient()
    const delHigh = useMutation({
        mutationKey: ["deleteHighlight"],
        mutationFn: (id: string|number) => deleteHighlight(id)
    })

    function mutate(id: string|number) {
        void toast.promise(
            delHigh.mutateAsync(id),
            {
                loading: "Cancellazione in corso...",
                success: ()=>{
                    void queryClient.invalidateQueries({ queryKey: ["highlightWords"] })
                    return "Evidenziazione cancellata con successo"
                },
                error: "Errore durante la cancellazione dell'evidenziazione"
            }
        )
    }

    return {
        mutate: (id: string|number) => mutate(id)
    }
}

type UpdateMutateType={
    id: number|string,
    newHighlight: SingleHighlightSchema
}

export function useUpdateHighlightWords() {

    const update = useMutation({
        mutationKey: ["updateHighlight"],
        mutationFn: ({id, newHighlight}: UpdateMutateType) => changeHighlight(id, newHighlight)
    })

    function mutate({id, newHighlight}: UpdateMutateType) {
        void toast.promise(
            update.mutateAsync({id, newHighlight}),
            {
                loading: "Aggiornamento in corso...",
                success: "Evidenziazione aggiornata con successo",
                error: "Errore durante l'aggiornamento dell'evidenziazione"
            }
        )
    }

    return {
        mutate:({id, newHighlight}: UpdateMutateType) => mutate({id, newHighlight})
    }
}
